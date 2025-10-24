"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SecurityTest() {
  const [testResults, setTestResults] = useState<{
    csp: boolean;
    headers: boolean;
    rateLimit: boolean;
  }>({
    csp: false,
    headers: false,
    rateLimit: false,
  });

  const testSecurity = async () => {
    try {
      // Test 1: Check security headers
      const response = await fetch("/api/test-security", {
        method: "GET",
      });

      const headers = response.headers;
      const hasCSP = headers.get("content-security-policy") !== null;
      const hasFrameOptions = headers.get("x-frame-options") === "DENY";
      const hasContentTypeOptions =
        headers.get("x-content-type-options") === "nosniff";

      setTestResults(prev => ({
        ...prev,
        csp: hasCSP,
        headers: hasFrameOptions && hasContentTypeOptions,
      }));

      // Test 2: Tester le rate limiting
      const promises = Array.from({ length: 5 }, () =>
        fetch("/api/test-rate-limit", { method: "GET" })
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status === 429);

      setTestResults(prev => ({
        ...prev,
        rateLimit: rateLimited,
      }));
    } catch (error) {
      console.error("Erreur lors du test de sécurité:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Test de Sécurité</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <button
          onClick={testSecurity}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Lancer les Tests de Sécurité
        </button>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Content Security Policy (CSP)</span>
            <span
              className={testResults.csp ? "text-green-500" : "text-red-500"}
            >
              {testResults.csp ? "✅" : "❌"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Headers de Sécurité</span>
            <span
              className={
                testResults.headers ? "text-green-500" : "text-red-500"
              }
            >
              {testResults.headers ? "✅" : "❌"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Rate Limiting</span>
            <span
              className={
                testResults.rateLimit ? "text-green-500" : "text-red-500"
              }
            >
              {testResults.rateLimit ? "✅" : "❌"}
            </span>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p>Ces tests vérifient :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Présence des headers CSP</li>
            <li>Configuration des headers de sécurité</li>
            <li>Fonctionnement du rate limiting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
