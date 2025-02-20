import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface SubscriptionSettingsProps {
    section?: 'plan' | 'billing';
  }
  
  export function SubscriptionSettings({ section }: SubscriptionSettingsProps) {
  const { t } = useTranslation();

  const plans = [
    {
      name: t("settings.subscription.freePlan"),
      price: "0€",
      features: [
        t("settings.subscription.features.savedGames", "3 parties sauvegardées maximum"),
        t("settings.subscription.features.basicAI", "IA basique"),
        t("settings.subscription.features.standardSupport", "Support standard"),
      ]
    },
    {
      name: t("settings.subscription.proPlan"),
      price: "5€",
      period: t("settings.subscription.monthly"),
      features: [
        t("settings.subscription.features.unlimitedGames", "Parties sauvegardées illimitées"),
        t("settings.subscription.features.advancedAI", "IA avancée"),
        t("settings.subscription.features.prioritySupport", "Support prioritaire"),
        t("settings.subscription.features.exclusiveContent", "Contenu exclusif"),
      ],
      current: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.current ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-sm">/{plan.period}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              {!plan.current ? (
                <Button className="w-full mt-4">
                  {t("settings.subscription.upgrade")}
                </Button>
              ) : (
                <Button variant="outline" className="w-full mt-4">
                  {t("settings.subscription.currentPlan")}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.subscription.billing")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Historique des paiements et factures */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
