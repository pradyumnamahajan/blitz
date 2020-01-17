import React, { Component } from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, PermissionsAndroid } from 'react-native';
// import { createAppContainer } from 'react-navigation';
// import { createStackNavigator } from 'react-navigation-stack';
import MapView, { Marker, Callout } from 'react-native-maps';
import Realm from 'realm'
import cropSchema from './../storage/realm/cropSchema'
import RNFS from 'react-native-fs'
import Geolocation from '@react-native-community/geolocation';

async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message:
          'Cropdex needs to access your Location',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Permission granted');
    } else {
      console.log('permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}

class Maps extends Component {
  constructor(props) {
    super(props)
    this.state = {
      markers: [],
      location: null,
    }
  }

  getInitialState() {
    return {
      markers: []
    };
  }

  fetchCoordinates = async () => {

    let a = await Realm.open({
      path: RNFS.DocumentDirectoryPath + '/Realm_db/Database/Crops.realm',
      schema: [cropSchema]
    }).then(async (realm) => {
      var json_str = JSON.parse(JSON.stringify(realm.objects('Crop')));
      console.log(json_str)
      var fjson = []
      var id = 0;
      while (json_str[id] != undefined) {
        let x = json_str[id]
        let date = x.data_added.slice(0, 10)
        let time = x.data_added.slice(12, 19)
        console.log(date)
        let y = {
          latitude: x.lat,
          longitude: x.lon,
          des: "id : " + id + "\nCrop Name : " + x.classify + "\nCaptured on " + date + " \nat " + time + "hrs",
        }
        fjson.push(y)
        id++


      }
      return fjson

    }).then((fjson) => {
      var elements = fjson.map(function (e, index) {
        return {
          id: index.toString(),
          latlng: {
            latitude: parseFloat(e.latitude),
            longitude: parseFloat(e.longitude),
          },
          description: e.des,
        }
      });
      this.setState({
        markers: elements
      });
      console.log(this.state.markers)
    })
  }

  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getUserLocation = async () => {
    await requestLocationPermission();
    const config = {
      authorizationLevel: "whenInUse",
    }

    Geolocation.setRNConfiguration(config);
    Geolocation.getCurrentPosition(
      position => {
        console.log(position);
        this.setState({ location: position });
        console.log(this.state.location.coords.latitude);

      },
      error => Alert.alert(error.message),
      //{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }

  componentDidMount = async () => {
    console.log('maps')
    this.getUserLocation()
    this.fetchCoordinates()


  }




  render() {
    if (this.state.location != null) {
      if (this.state.markers.length != 0) {
        return (
          <View>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: this.state.location.coords.latitude,
                longitude: this.state.location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {this.state.markers.map(marker => {
                return (
                  <Marker
                    coordinate={marker.latlng}
                    description={marker.description}
                    title={marker.id}
                  >
                    <Callout><Text>{marker.description}</Text></Callout>
                  </Marker>
                )


              })}
            </MapView>
          </View>
        )

      }
      else {
        return (

          <View>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: this.state.location.coords.latitude,
                longitude: this.state.location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >

            </MapView>
          </View>
        )
      }
    }
    else {
      return (

        <View>
          <Text>Loading</Text>
        </View>
      )
    }




  }
}

const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%",
  },
});

export default Maps;

