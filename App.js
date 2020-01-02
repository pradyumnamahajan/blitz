
import React, {Component} from 'react';
import { View, Text } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import HomeScreen from './screens/HomeScreen.js'

import ImageSelect from './screens/ImageSelect.js'
import Add from './screens/Add.js'




const AppNavigator = createStackNavigator({
  Home:  HomeScreen,
  database : Add,
  gallery : ImageSelect
});
 
export default createAppContainer(AppNavigator);

