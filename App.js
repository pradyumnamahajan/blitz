
import React, {Component} from 'react';
import { Platform } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { MenuProvider } from 'react-native-popup-menu';
import HomeScreen from './screens/HomeScreen.js'

import ImageSelect from './screens/ImageSelect.js'
import CameraRollView from './screens/CameraRollView'

import ViewDB from './screens/ViewDB'
import ExportPage from './screens/ExportPage'

let displayHeader
Platform.OS == 'ios' ? displayHeader = true : displayHeader = false
console.log(displayHeader)
const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  Database: {
    screen: ViewDB,
    
  },
  // 'Select Image': {
  //   screen: ImageSelect,
  //   navigationOptions: {
  //     headerShown: displayHeader,
  //   },
  // },

  'Select Image': {
    screen: CameraRollView,
    
  },

  'Export': {
    screen: ExportPage,
  },
})
 

const AppContainer = createAppContainer(AppNavigator);


export default () => (
  <MenuProvider>
    <AppContainer />
  </MenuProvider>
)



