import analytics from "@react-native-firebase/analytics";
import { Platform } from "react-native";

export const analyticsEvents = {
  onboarding_skip: "onboarding_skip",
  onboarding_complete: "onboarding_complete",
  auth_submit: "auth_submit",
  auth_success: "auth_success",
  auth_failure: "auth_failure",
  question_sets_search_submit: "question_sets_search_submit",
  question_sets_filter_apply: "question_sets_filter_apply",
  question_sets_filter_tag_toggle: "question_sets_filter_tag_toggle",
  question_set_open: "question_set_open",
  question_set_start: "question_set_start",
  question_set_bookmark_toggle: "question_set_bookmark_toggle",
  quiz_start: "quiz_start",
  quiz_answer: "quiz_answer",
  quiz_timeout: "quiz_timeout",
  quiz_submit: "quiz_submit",
  quiz_complete: "quiz_complete",
  quiz_exit: "quiz_exit",
  lockscreen_permission: "lockscreen_permission",
  lockscreen_notification_scheduled: "lockscreen_notification_scheduled",
  lockscreen_notification_open: "lockscreen_notification_open",
  lockscreen_quick_question_answer: "lockscreen_quick_question_answer",
  api_error: "api_error",
  api_latency: "api_latency",
} as const;

export type AnalyticsEventName =
  (typeof analyticsEvents)[keyof typeof analyticsEvents];
export type AnalyticsParams = Record<
  string,
  string | number | null | undefined
>;

const analyticsEnabled = Platform.OS !== "web";

export async function logEvent(
  name: AnalyticsEventName,
  params?: AnalyticsParams,
) {
  if (!analyticsEnabled) {
    return;
  }

  try {
    await analytics().logEvent(name, params);
  } catch {
    // Avoid crashing on analytics errors in dev builds.
  }
}

export async function logScreenView(screenName: string, screenClass = "App") {
  if (!analyticsEnabled) {
    return;
  }

  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass,
    });
  } catch {
    // Avoid crashing on analytics errors in dev builds.
  }
}
