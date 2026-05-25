import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { funfantiApi } from "./funfantiApi";
import { QuizQuestion } from "../data/funfantiContent";
import { analyticsEvents, logEvent } from "./analytics";
import { getUpcomingNotificationCheckDates } from "../utils/notificationPreferences";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * In-memory set of question IDs the user has answered correctly during this
 * session. Correctly answered questions are sorted to the END of the
 * notification queue so fresh questions always appear first.
 */
const correctlyAnsweredQuestionIds = new Set<string>();

/**
 * Call this whenever the user answers a quick-question notification correctly.
 * After calling this, invoke notificationService.replenishQuestionQueue() so
 * the updated order takes effect immediately.
 */
export function markQuestionAsCorrect(questionId: string): void {
  correctlyAnsweredQuestionIds.add(questionId);
}

export const notificationService = {
  async requestPermissionsAsync() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      void logEvent(analyticsEvents.lockscreen_permission, {
        granted: finalStatus === "granted" ? 1 : 0,
        status: finalStatus,
      });
      return finalStatus === "granted";
    }
    void logEvent(analyticsEvents.lockscreen_permission, {
      granted: 0,
      status: "unavailable",
    });
    return false;
  },

  async clearAllScheduledNotifications() {
    if (Platform.OS === "web") {
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async replenishQuestionQueue(
    accessToken?: string | null,
    lockScreenTiming?: unknown,
    notificationOverlay = true,
  ) {
    if (Platform.OS === "web") {
      return;
    }

    // 1. Clear existing queue
    await this.clearAllScheduledNotifications();

    if (!accessToken || !notificationOverlay) return;

    const upcomingCheckDates = getUpcomingNotificationCheckDates(
      new Date(),
      lockScreenTiming,
      10,
    );
    if (upcomingCheckDates.length === 0) {
      return;
    }

    // 2. Fetch bookmarks
    const bookmarks = await funfantiApi.getBookmarks(accessToken);
    if (!bookmarks || bookmarks.length === 0) {
      return; // Nothing to schedule
    }

    // 3. Gather questions from up to 3 random bookmarked sets to avoid too many API calls
    const setsToFetch = bookmarks.sort(() => 0.5 - Math.random()).slice(0, 3);
    let allQuestions: QuizQuestion[] = [];

    for (const b of setsToFetch) {
      const qs = await funfantiApi.getQuestionSetQuestions(b.questionSet.id);
      allQuestions = allQuestions.concat(qs);
    }

    if (allQuestions.length === 0) {
      return;
    }

    // 4. Shuffle questions
    allQuestions.sort(() => 0.5 - Math.random());

    // 5. Push questions already answered correctly to the end so fresh/unseen
    //    questions are always presented first.
    allQuestions.sort((a, b) => {
      const aCorrect = correctlyAnsweredQuestionIds.has(a.id) ? 1 : 0;
      const bCorrect = correctlyAnsweredQuestionIds.has(b.id) ? 1 : 0;
      return aCorrect - bCorrect;
    });

    // 6. Schedule checks every 15 minutes, only inside configured intervals.
    const scheduledCount = Math.min(
      upcomingCheckDates.length,
      allQuestions.length,
    );
    for (let i = 0; i < scheduledCount; i++) {
      const triggerDate = upcomingCheckDates[i];

      const question = allQuestions[i];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time for a Quick Question!",
          body: question.prompt,
          data: { question },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    }

    if (scheduledCount > 0) {
      void logEvent(analyticsEvents.lockscreen_notification_scheduled, {
        scheduled_count: scheduledCount,
        question_pool_count: allQuestions.length,
        bookmark_set_count: bookmarks.length,
      });
    }
  },
};
