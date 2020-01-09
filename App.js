
import React, {Component} from 'react';
import { View, Text } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import HomeScreen from './screens/HomeScreen.js'

import ImageSelect from './screens/ImageSelect.js'
import Add from './screens/Add.js'

import ViewDB from './screens/ViewDB'




const AppNavigator = createStackNavigator({
  Home:  HomeScreen,
  Database : ViewDB,
  Gallery : ImageSelect
});
 
export default createAppContainer(AppNavigator);

