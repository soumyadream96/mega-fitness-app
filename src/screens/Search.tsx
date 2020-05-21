import React, { useState, useRef, MutableRefObject } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, SearchBar, Button, ListItem } from 'react-native-elements';
import PropTypes from 'prop-types';
import USDAApiImpl from '../ApiHelpers/USDA/USDAApiImpl';
import OFDApiImpl from '../ApiHelpers/OFD/OFDApiImpl';
import { FoodResult, FoodDetails } from '../ApiHelpers/CommonAPITypes';
import Toast from 'react-native-simple-toast';
import SwitchGroup from '../components/SwitchGroup';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function Search({ navigation }): JSX.Element {
  const USDAapi = new USDAApiImpl();
  const OFDApi = new OFDApiImpl();

  const [searchText, updateSearchText] = useState('');
  const [results, updateResults] = useState(null);
  const [page, updatePage] = useState(0);
  const [loadingState, setLoadingState] = useState(false);
  const [isFranceLocale, setIsFranceLocale] = useState(true);
  const [shouldUseOFD, setShouldUseOFD] = useState(true);
  const [isAtEndOfResults, setEnd] = useState(false);
  const foodList: MutableRefObject<FlatList<FoodResult>> = useRef();

  const scanBarcode = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    if (status === 'granted') {
      navigation.navigate('BarCodeScanner');
    } else {
      Alert.prompt('You cannot search by barcode without camera access.');
    }
  };

  const handleSubmit = (): void => {
    try {
      foodList &&
        foodList.current &&
        foodList.current.scrollToOffset({ animated: false, offset: 0 });
      getResults(true);
    } catch (e) {
      showErrorToast();
    }
  };

  const getResults = async (isReset: boolean) => {
    setLoadingState(true);
    const pageToGet = isReset ? 0 : page + 1;
    const newResults = shouldUseOFD
      ? await OFDApi.search(searchText, isFranceLocale, pageToGet)
      : await USDAapi.search(searchText, pageToGet);
    updateResults(isReset ? [...newResults] : [...results, ...newResults]);
    updatePage(pageToGet);
    setEnd(newResults.length ? false : true);
    setLoadingState(false);
  };

  const showErrorToast = () =>
    Toast.showWithGravity(
      'There was a network error',
      Toast.LONG,
      Toast.CENTER
    );

  const showNotEnoughDetailsToast = () =>
    Toast.showWithGravity(
      "There isn't sufficient information for this food",
      Toast.SHORT,
      Toast.CENTER
    );

  const goToFoodDetails = async (api: string, id: string): Promise<void> => {
    try {
      let details: FoodDetails;
      switch (api) {
        case 'Open Food Data':
          details = await OFDApi.getDetails(id);
          break;
        case 'USDA':
          details = await USDAapi.getDetails(id);
          break;
        default:
          details = null;
      }

      if (details) {
        navigation.navigate('Details', { details });
      } else {
        showNotEnoughDetailsToast();
      }
    } catch (e) {
      showErrorToast();
    }
  };

  return (
    <View style={styles.screenContainer}>
      <Text h2>Search for a food</Text>
      <SearchBar
        value={searchText}
        onChangeText={(text): void => updateSearchText(text)}
        containerStyle={{
          marginVertical: 10,
        }}
      />
      <SwitchGroup
        value={shouldUseOFD}
        onValueChange={setShouldUseOFD}
        switchText={shouldUseOFD ? 'Open Food Data' : 'USDA'}
        toolTipText={
          shouldUseOFD
            ? 'The Open Food Database is preferable for brand name foods.'
            : 'The USDA database is preferable for basic foods and ingredients.'
        }
        toolTipHeight={100}
        iconName="info"
      />
      <SwitchGroup
        value={!shouldUseOFD ? false : isFranceLocale}
        onValueChange={setIsFranceLocale}
        switchText={!shouldUseOFD ? 'USA' : isFranceLocale ? 'France' : 'USA'}
        toolTipText={
          'The Open Food Database can search for American or French brands.'
        }
        toolTipHeight={100}
        iconName="info"
      />
      <Button
        type={!searchText ? 'outline' : 'solid'}
        disabled={!searchText}
        loading={loadingState}
        raised
        title="Text search"
        onPress={handleSubmit}
      />
      <Button
        type="solid"
        loading={loadingState}
        raised
        title="Barcode Search"
        onPress={scanBarcode}
      />
      {results ? (
        results.length ? (
          <FlatList
            ref={foodList}
            data={results}
            keyExtractor={(item): string => item.id}
            renderItem={({ item }: { item: FoodResult }): JSX.Element => (
              <ListItem
                onPress={(): Promise<void> =>
                  goToFoodDetails(item.api, item.id)
                }
                title={item.description}
              />
            )}
            onEndReachedThreshold={0.5}
            onEndReached={() => !isAtEndOfResults && getResults(false)}
          />
        ) : (
          <Text>No items found</Text>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  switchGroupContainer: {
    flexDirection: 'row',
  },
  textContainer: {
    flex: 2,
  },
  emptyContainer: {
    flex: 1,
  },
  icon: {
    marginHorizontal: 15,
  },
});

Search.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};
