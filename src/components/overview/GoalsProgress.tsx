import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { useGoals } from "@/hooks/useGoals";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/EmptyState";

export default function GoalsProgress() {
  const { data: goals } = useGoals();

  if (!goals.length) {
    return (
      <EmptyState
        title="Sem metas"
        message="Crie metas para acompanhar o progresso"
        action={
          <Button asChild>
            <Link to="/metas">Adicionar meta</Link>
          </Button>
        }
      />
    );
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {goals.map((g) => {
        const pct = Math.round(g.progress_pct || 0);
        return (
          <div key={g.id}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="truncate">{g.title}</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} aria-label={`Progresso da meta ${g.title}`} />
          </div>
        );
      })}
      <div className="pt-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/metas">Ver todas</Link>
        </Button>
      </div>
    </motion.div>
  );
}
