import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { analyzeImage, PROMPTS } from "../lib/gemini";

type Analysis = {
  objects: string[];
  context: string;
  activities: string | string[];
  recommendations: string;
};

export default function ResultScreen() {
  const { base64Image } = useLocalSearchParams<{
    base64Image: string;
  }>();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runAnalysis();
  }, []);

  async function runAnalysis() {
    if (!base64Image) {
      setError("No image received.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeImage(base64Image, PROMPTS.academic);

      let text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Empty Gemini response.");
      }

      // Remove Markdown code fences
      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(text);

      setAnalysis(parsed);
    } catch (err) {
      console.log(err);

      setError("Could not analyze this image. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5B3FA3" />

        <Text style={styles.loadingText}>Analyzing image...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!analysis) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Objects</Text>

      {analysis.objects.map((obj, index) => (
        <Text key={index} style={styles.listItem}>
          • {obj}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>Context</Text>

      <Text style={styles.bodyText}>{analysis.context}</Text>

      <Text style={styles.sectionTitle}>Activities</Text>

      {Array.isArray(analysis.activities) ? (
        analysis.activities.map((activity, index) => (
          <Text key={index} style={styles.listItem}>
            • {activity}
          </Text>
        ))
      ) : (
        <Text style={styles.bodyText}>{analysis.activities}</Text>
      )}

      <Text style={styles.sectionTitle}>Recommendations</Text>

      <Text style={styles.bodyText}>{analysis.recommendations}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 15,
    color: "#5A6472",
    fontSize: 16,
  },

  errorText: {
    color: "#B3261E",
    fontSize: 16,
    textAlign: "center",
  },

  sectionTitle: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2A44",
  },

  listItem: {
    fontSize: 16,
    marginBottom: 6,
    color: "#2B2F38",
  },

  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#2B2F38",
  },
});
