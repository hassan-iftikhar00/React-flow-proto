import "./ReattemptFunnel.css";

/**
 * Reattempt Outcome Improvement Component
 * Shows success % improvement across attempts
 */
export default function ReattemptFunnel({ data }) {
  // data should be: [{ attempt: 1, successRate: 60 }, { attempt: 2, successRate: 78 }, ...]

  return (
    <div className="reattempt-funnel">
      <div className="funnel-stages">
        {data.map((stage, index) => {
          const improvement =
            index > 0 ? stage.successRate - data[index - 1].successRate : 0;
          const noImprovement = index > 0 && improvement <= 0;

          return (
            <div key={stage.attempt} className="funnel-stage">
              <div
                className="stage-bar"
                style={{ width: `${stage.successRate}%` }}
              >
                <span className="stage-label">Attempt {stage.attempt}</span>
                <span className="stage-value">{stage.successRate}%</span>
              </div>
              {index < data.length - 1 && (
                <div
                  className={`stage-arrow ${noImprovement ? "no-improvement" : ""}`}
                >
                  →
                  {improvement > 0 && (
                    <span className="improvement-label">
                      +{improvement.toFixed(1)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
