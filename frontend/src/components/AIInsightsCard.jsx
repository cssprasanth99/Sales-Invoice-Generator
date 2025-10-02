import { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const AIInsightsCard = () => {
  const { insights, setInsights } = useState(null);
  const { isLoading, setIsLoading } = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await axiosInstance.get(
          API_PATHS.AI.GET_DASHBOARD_SUMMARY
        );
        console.log("response", response);
        setInsights(response.data?.insights || []);
      } catch (error) {
        console.error(error);
        setInsights(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div>
      <div>
        <Lightbulb />
        <h3>AI Insights</h3>
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-200 w-3/4"></div>
            <div className="h-4 bg-slate-200 w-5/6"></div>
            <div className="h-4 bg-slate-200 w-1/2"></div>
          </div>
        ) : (
          <ul className="space-y-3 list-disc text-slate-600 ">
            {insights?.map((insight, index) => (
              <li key={index} className="text-sm">
                {insight}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AIInsightsCard;
