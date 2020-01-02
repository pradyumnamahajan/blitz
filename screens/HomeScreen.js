import React, { Component } from 'react';
import {View , Text, Button, StyleSheet, ImageBackground} from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';


export default class HomeScreen extends Component{
  render(){
    return(

      ///<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ImageBackground source={require('./crop.png')} style={styles.backgroundImage} >
        <Text>Home Screen</Text>
        <Button
          title="VIEW DATABASE"
          onPress={() => this.props.navigation.navigate('database')}
        />
        <View style ={styles.filler} />
        <Button
          title = "Select/Capture Image"
          onPress={() => this.props.navigation.navigate('gallery')}
        />
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  filler: {
        height : 100,
        width : 100,
        color : 'white'
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center', 
    justifyContent: 'center' 
  }

})


