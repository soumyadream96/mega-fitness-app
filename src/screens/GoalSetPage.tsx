import React, { useState, useEffect } from 'react';
import { Text } from 'react-native-elements';
import { View, StyleSheet } from 'react-native';
import { container, UserPropTypes } from '../store/reducers/User';
import GoalPrompt from '../components/GoalPrompt';
import Toast from 'react-native-simple-toast';
import { userDocumentService } from '../Firebase';
import CustomHeader from '../components/Header';
import { UserDocument } from '../Firebase/Documents/UserDocument';

function GoalSetPage({ user, storeCalories }): JSX.Element {
  const [isLoading, toggleIsLoading] = useState(false);
  const [goalCaloriesInput, setGoalCaloriesInput] = useState('0');
  const [goalWaterInput, setGoalWaterInput] = useState('0');

  const checkIsNumber = (setGoal: (number: number) => void) => {
    const goalCaloriesNumber = Number(goalCaloriesInput);
    if (!goalCaloriesNumber || Number.isNaN(goalCaloriesNumber)) {
      Toast.showWithGravity('Please enter a number', Toast.SHORT, Toast.CENTER);
    } else {
      try {
        toggleIsLoading(true);
        setGoal(goalCaloriesNumber);
        toggleIsLoading(false);
      } catch (e) {
        Toast.showWithGravity(
          "Your goal couldn't be saved",
          Toast.SHORT,
          Toast.CENTER
        );
      }
    }
  };

  const setWaterGoal = async (goal: number) => {
    await userDocumentService.updateWaterGoal(user.uid, goal);
    setGoalWaterInput(goal.toString());
  };

  const setCalorieGoal = async (goal: number): Promise<void> => {
    await userDocumentService.updateCalorieGoal(user.uid, goal);
    setGoalCaloriesInput(goal.toString());
  };

  useEffect(() => {
    if (user.goalCalories) {
      setGoalCaloriesInput(user.goalCalories.toString());
    }

    const unsubscribeUserListener = userDocumentService.getDocumentListener(
      user.uid,
      (userDocument: UserDocument) => {
        storeCalories(userDocument.goalCalories);
      }
    );
    return () => {
      unsubscribeUserListener();
    };
  }, [user.uid, user.goalCalories, storeCalories]);

  return (
    <View style={style.content}>
      <CustomHeader title="Calorie goal" />
      <Text h2>Goals for</Text>
      <Text h4>{user.email}</Text>
      <GoalPrompt
        goal={goalCaloriesInput}
        setGoal={setGoalCaloriesInput}
        onConfirmButtonPress={checkIsNumber}
        loading={isLoading}
        clearGoal={() => setCalorieGoal(0)}
        title="Daily calorie goal"
      />
      <GoalPrompt
        goal={goalWaterInput}
        setGoal={setGoalWaterInput}
        onConfirmButtonPress={() => checkIsNumber(setWaterGoal)}
        loading={isLoading}
        clearGoal={() => setWaterGoal(0)}
        title="Daily water goal"
      />
    </View>
  );
}

const style = StyleSheet.create({
  content: {
    flex: 1,
  },
});

GoalSetPage.propTypes = {
  ...UserPropTypes,
};

export default container(GoalSetPage);
