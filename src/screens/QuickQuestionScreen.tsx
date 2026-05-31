import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { QuizQuestion } from "../data/funfantiContent";
import { ArtBlock } from "../components/ArtBlock";
import { resolveApiUrl } from "../services/funfantiApi";
import { analyticsEvents, logEvent } from "../services/analytics";

type QuickQuestionScreenProps = {
  question: QuizQuestion | null;
  /** Called when the user dismisses the screen. wasCorrect is true when they answered correctly. */
  onClose: (wasCorrect?: boolean) => void;
};

export const QuickQuestionScreen: React.FC<QuickQuestionScreenProps> = ({
  question,
  onClose,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const imageSource = question?.imageSource ?? (question?.imageUrl ? { uri: resolveApiUrl(question.imageUrl) || question.imageUrl } : undefined);
  const shouldShowImage = Boolean(imageSource) && !imageLoadFailed;

  useEffect(() => {
    setImageLoadFailed(false);
  }, [question?.id, question?.imageUrl]);

  const handleClose = (wasCorrect?: boolean) => {
    onClose(wasCorrect);
  };

  if (!question) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>No question loaded.</Text>
          <Pressable style={styles.primaryButton} onPress={() => handleClose()}>
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleChoice = (choiceId: string) => {
    if (selectedChoice) return;
    const correctChoice = question.choices.find((choice) => choice.correct);
    const isCorrect = correctChoice?.id === choiceId;
    void logEvent(analyticsEvents.lockscreen_quick_question_answer, {
      question_id: question.id,
      choice_id: choiceId,
      is_correct: isCorrect ? 1 : 0,
    });
    setSelectedChoice(choiceId);
  };

  const correctChoice = question?.choices.find((c) => c.correct);
  const wasCorrect =
    selectedChoice !== null && correctChoice?.id === selectedChoice;

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <Pressable onPress={() => handleClose()}>
            <Text style={styles.backLabel}>‹ Back</Text>
          </Pressable>
          <Text style={styles.meta}>{question.topic}</Text>
        </View>

        <View style={styles.card}>
          {shouldShowImage ? (
            <ArtBlock
              tone={question.artTone || "#DDF7FA"}
              variant="quiz"
              imageSource={imageSource}
              onImageError={() => setImageLoadFailed(true)}
            />
          ) : null}
          <Text style={styles.prompt}>{question.prompt}</Text>

          <View style={styles.choiceStack}>
            {question.choices.map((choice, index) => {
              const active = selectedChoice === choice.id;
              const isCorrect = choice.correct;
              const showCorrectness = selectedChoice !== null;
              // Display A, B, C, D instead of raw choice IDs
              const letter = String.fromCharCode(65 + index);

              let choiceStyle:
                | typeof styles.choiceButton
                | (typeof styles.choiceButton | typeof styles.choiceCorrect)[] =
                styles.choiceButton;
              if (showCorrectness) {
                if (isCorrect)
                  choiceStyle = [
                    styles.choiceButton,
                    styles.choiceCorrect,
                  ] as const;
                else if (active && !isCorrect)
                  choiceStyle = [
                    styles.choiceButton,
                    styles.choiceWrong,
                  ] as const;
              }

              return (
                <Pressable
                  key={choice.id}
                  style={choiceStyle}
                  onPress={() => handleChoice(choice.id)}
                >
                  <Text style={styles.choiceLetter}>{letter}</Text>
                  <Text style={styles.choiceText}>{choice.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {selectedChoice && (
            <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>Explanation</Text>
              <Text style={styles.hintText}>{question.explanation}</Text>

              <Pressable
                style={styles.continueButton}
                onPress={() => handleClose(wasCorrect)}
              >
                <Text style={styles.continueButtonText}>Got it</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#ffffff" },
  container: { padding: 24, paddingBottom: 48 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: { fontSize: 16, color: "#333", marginBottom: 20 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  backLabel: { fontSize: 16, color: "#555", fontWeight: "600" },
  meta: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#fcfcfc",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  prompt: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginVertical: 24,
    lineHeight: 30,
  },
  choiceStack: { gap: 12 },
  choiceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  choiceCorrect: { backgroundColor: "#eefcf1", borderColor: "#4caf50" },
  choiceWrong: { backgroundColor: "#fff2f2", borderColor: "#f44336" },
  choiceLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    textAlign: "center",
    lineHeight: 32,
    fontWeight: "700",
    color: "#555",
    marginRight: 16,
    overflow: "hidden",
  },
  choiceText: { fontSize: 16, color: "#222", flex: 1, fontWeight: "500" },
  hintBox: {
    marginTop: 32,
    padding: 20,
    backgroundColor: "#f0f4f8",
    borderRadius: 16,
  },
  hintTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  hintText: { fontSize: 16, color: "#333", lineHeight: 24, marginBottom: 20 },
  continueButton: {
    backgroundColor: "#111",
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: "center",
  },
  continueButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  primaryButton: {
    backgroundColor: "#111",
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
