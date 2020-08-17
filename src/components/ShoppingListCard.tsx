import React from 'react';
import { Card, Text, CheckBox, Button, Icon } from 'react-native-elements';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import UpDownButtons from './UpDownButtons';

export default function ShoppingListCard({
  list,
  updateAmount,
  toggleCheckBox,
  refreshList,
}): JSX.Element {
  return (
    <Card
      title={
        <View style={style.headerContainer}>
          <View />
          <Text h4>Shopping List</Text>
          <View style={style.buttonContainer}>
            <Button icon={<Icon name="save" />} />
            <Button icon={<Icon name="autorenew" />} onPress={refreshList} />
          </View>
        </View>
      }
    >
      {Object.keys(list).map((food) =>
        Object.keys(list[food]).map((portion) => (
          <View
            key={food + portion}
            style={list[food][portion].checked && style.checkedItem}
          >
            <View style={style.heading}>
              <CheckBox
                checked={list[food][portion].checked}
                onPress={() =>
                  toggleCheckBox(food, portion, list[food][portion].checked)
                }
              />
              <Text style={style.listItem}>{food}</Text>
            </View>
            <View style={style.subItem}>
              <UpDownButtons
                total={list[food][portion].amount}
                onValueChange={(updatedNumber: string) =>
                  !list[food][portion].checked &&
                  updateAmount(food, portion, updatedNumber)
                }
              />
              <Text>
                {list[food][portion].amount} {portion}
              </Text>
            </View>
          </View>
        ))
      )}
    </Card>
  );
}

ShoppingListCard.propTypes = {
  list: PropTypes.objectOf(
    PropTypes.objectOf(PropTypes.oneOfType([PropTypes.number, PropTypes.bool]))
  ).isRequired,
  updateAmount: PropTypes.func.isRequired,
  toggleCheckBox: PropTypes.func.isRequired,
  refreshList: PropTypes.func.isRequired,
};

const style = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItem: {
    textAlign: 'left',
    fontSize: 20,
    flex: 1,
  },
  checkedItem: {
    opacity: 0.5,
  },
  subItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
