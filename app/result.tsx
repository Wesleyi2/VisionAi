import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { ANALYSIS_PROMPT, analyzeImage } from "../lib/gemini";

export default function ResultScreen() {
  const { base64Image } = useLocalSearchParams<{
    base64Image: string;
  }>();

  // Verify the API key is being read
  console.log("Gemini Key:", process.env.EXPO_PUBLIC_GEMINI_KEY?.slice(0, 10));

  useEffect(() => {
    runAnalysis();
  }, []);

  async function runAnalysis() {
    if (!base64Image) return;

    try {
      const response = await analyzeImage(base64Image, ANALYSIS_PROMPT);

      console.log("Gemini Response:");
      console.log(response);
    } catch (error) {
      console.log("Gemini Error:", error);
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2E5BBA" />

      <Text style={styles.title}>Analyzing Image...</Text>

      <Text style={styles.subtitle}>
        Please wait while Gemini analyzes your photo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: "bold",
  },

  subtitle: {
    marginTop: 10,
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },
});
