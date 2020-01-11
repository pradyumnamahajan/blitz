
import React, {Component} from 'react';
import { Platform } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
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
  Database: ViewDB,
  Gallery: ImageSelect,
})
 
export default createAppContainer(AppNavigator);

