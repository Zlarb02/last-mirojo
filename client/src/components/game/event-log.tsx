import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

export function EventLog() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("game.events.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <p className="text-sm text-muted-foreground">
            {t("game.events.empty")}
          </p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
