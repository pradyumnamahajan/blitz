
import React, {Component} from 'react';
import { Platform } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { MenuProvider } from 'react-native-popup-menu';
import HomeScreen from './screens/HomeScreen.js'

import ImageSelect from './screens/ImageSelect.js'


import ViewDB from './screens/ViewDB'

let displayHeader
Platform.OS == 'ios' ? displayHeader = true : displayHeader = false
console.log(displayHeader)
const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      headerShown: displayHeader,
    }
  },
  Database: {
    screen: ViewDB,
    // navigationOptions: {
    //   headerShown: displayHeader,
    // },
  },
  'Select Image': {
    screen: ImageSelect,
    navigationOptions: {
      headerShown: displayHeader,
    },
  },
})
 

const AppContainer = createAppContainer(AppNavigator);


export default () => (
  <MenuProvider>
    <AppContainer />
  </MenuProvider>
)