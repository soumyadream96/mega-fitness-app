import moment from 'moment';

export const getTotal = (nutrient: string) => (
  accumulator: number,
  currentValue: { [key: string]: any }
): number => accumulator + currentValue[nutrient];

export function createWeeklyReport(
  mealDocuments: { [key: string]: any }[],
  dayDocuments: { [key: string]: any }[]
) {
  const mealCaloriesTotalReducer = (
    accum: number,
    next: { [key: string]: any }
  ) => accum + next.calories;

  const dayCaloriesTotalReducer = (
    accum: { [key: string]: any },
    next: { [key: string]: any }
  ) => {
    const dayString = moment(next.eatenAt).startOf('day').format('dddd');
    if (accum.hasOwnProperty(dayString)) {
      accum[dayString] = next.meal.reduce(
        mealCaloriesTotalReducer,
        accum[dayString]
      );
    } else {
      accum[dayString] = next.meal.reduce(mealCaloriesTotalReducer, 0);
    }
    return accum;
  };

  const dayCalorieGoalReducer = (
    accum: { [key: string]: any },
    next: { [key: string]: any }
  ) => {
    const dayString = moment(next.date).startOf('day').format('dddd');
    accum[dayString] = next.goalCalories;
    return accum;
  };

  const averageNutrientsReducer = (
    accum: { [key: string]: number },
    next: { [key: string]: number },
    index: number,
    array: []
  ) => {
    accum.calories += next.calories;
    accum.protein += next.protein;
    accum.carbs += next.carbs;
    accum.fats += next.fats;
    if (index === array.length - 1) {
      accum.calories /= array.length;
      accum.protein /= array.length;
      accum.carbs /= array.length;
      accum.fats /= array.length;
    }
    return accum;
  };

  const createTotalCardData = (mealsDocs: { [key: string]: any }[]) =>
    mealsDocs
      .flatMap((document: { [key: string]: any }) => document.meal)
      .reduce(averageNutrientsReducer, {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      });

  const createGraphData = (
    mealsDocs: { [key: string]: any }[],
    dayDocs: { [key: string]: any }[]
  ) => {
    const mealTotalsGroupedByDay = mealsDocs.reduce(
      dayCaloriesTotalReducer,
      {}
    );

    const dayDocumentsRegrouped = dayDocs.reduce(dayCalorieGoalReducer, {});

    const days = Array.from(
      new Set([
        ...Object.keys(mealTotalsGroupedByDay),
        ...Object.keys(dayDocumentsRegrouped),
      ])
    );

    return days.map((day) => ({
      day,
      eaten: mealTotalsGroupedByDay[day] || 0,
      goal: dayDocumentsRegrouped[day] || 0,
    }));
  };

  return {
    averages: createTotalCardData(mealDocuments),
    graphData: createGraphData(mealDocuments, dayDocuments),
  };
}
