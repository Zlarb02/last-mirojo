import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, FileText, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionSettingsProps {
  section?: "plan" | "billing";
}

export function SubscriptionSettings({
  section = "plan",
}: SubscriptionSettingsProps) {
  const { t } = useTranslation();

  const plans = [
    {
      name: t("settings.subscription.freePlan"),
      price: "0€",
      features: [
        t(
          "settings.subscription.features.savedGames",
          "3 parties sauvegardées maximum"
        ),
        t("settings.subscription.features.basicAI", "IA basique"),
        t("settings.subscription.features.standardSupport", "Support standard"),
      ],
    },
    {
      name: t("settings.subscription.proPlan"),
      price: "5€",
      period: t("settings.subscription.monthly"),
      features: [
        t(
          "settings.subscription.features.unlimitedGames",
          "Parties sauvegardées illimitées"
        ),
        t("settings.subscription.features.advancedAI", "IA avancée"),
        t(
          "settings.subscription.features.prioritySupport",
          "Support prioritaire"
        ),
        t(
          "settings.subscription.features.exclusiveContent",
          "Contenu exclusif"
        ),
      ],
      current: true,
    },
  ];

  const renderBillingHistory = () => {
    const bills = [
      {
        date: "2024-02-01",
        amount: "5€",
        status: "Payé",
        invoice: "#INV-2024-02",
      },
      {
        date: "2024-01-01",
        amount: "5€",
        status: "Payé",
        invoice: "#INV-2024-01",
      },
      {
        date: "2023-12-01",
        amount: "5€",
        status: "Payé",
        invoice: "#INV-2023-12",
      },
    ];

    return (
      <div className="space-y-4">
        {bills.map((bill) => (
          <div
            key={bill.invoice}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex flex-col gap-1">
              <div className="font-medium">{bill.invoice}</div>
              <div className="text-sm text-muted-foreground">{bill.date}</div>
            </div>
            <div className="flex items-center gap-4">
              <span>{bill.amount}</span>
              <span className="text-sm text-green-600 dark:text-green-400">
                {bill.status}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (section === "billing") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {t("settings.subscription.billing")}
            </CardTitle>
            <CardDescription>
              {t("settings.subscription.billingHistory")}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderBillingHistory()}</CardContent>
        </Card>
      </div>
    );
  }

  // Section plan (default)
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              plan.current && "border-primary",
              "flex flex-col justify-between"
            )}
          >
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
    </div>
  );
}
