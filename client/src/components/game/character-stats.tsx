import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";

export function CharacterStats() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("game.stats.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("game.stats.health")}</span>
            <span>100/100</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("game.stats.mana")}</span>
            <span>50/100</span>
          </div>
          <Progress value={50} className="h-2" />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">{t("game.stats.level")}</span>
          <span className="text-2xl font-bold">1</span>
        </div>
      </CardContent>
    </Card>
  );
}
