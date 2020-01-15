
import React, { Fragment, Component } from 'react';
import ImagePicker from 'react-native-image-picker';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
  PermissionsAndroid
} from 'react-native';



import RNFS from 'react-native-fs'
import Realm from 'realm'
import Geolocation from '@react-native-community/geolocation';
import cropSchema from './../storage/realm/cropSchema'


const createFormData = (photo, body) => {
  const data = new FormData();
  console.log(photo.fileName);
  data.append("photo", {
    name: photo.fileName,
    type: photo.type,
    uri:
      Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", "")
  });

  Object.keys(body).forEach(key => {
    data.append(key, body[key]);
  });

  return data;
};


const requestLocationPermission = async () => {
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

export default class ImageSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      photo: '',
      prediction: null,
      location:null,
    }
  }

  chooseImage = () => {
    let options = {
      title: 'Select Image',

      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }

      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        alert(response.customButton);
      } else {
        const source = { uri: response.uri };
        this.setState({
          photo: response,
        });

        console.log(this.state.photo.uri);

      }
    });
  }




  renderFileUri = () => {

    if (this.state.photo.uri) {
      return <Image
        source={{ uri: this.state.photo.uri }}
        style={styles.images}
      />
    } else {
      return <Image
        source={require('./../assets/dummy.png')}
        style={styles.images}
      />
    }
  }

  handleUploadPhoto = async () => {

    try {
      var photo = {
        type: this.state.photo.type,
        uri: this.state.photo.uri,
        name: 'uploadImage.png',
      };

      var formData = new FormData();

      formData.append('submit', 'ok');
      formData.append('file', photo);

      let response = await fetch("https://blitz-crop-app.appspot.com/analyze", {
        method: "POST",
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      })



      let responseJSON = await response.json()

      this.setState({
        prediction: responseJSON.result,
      });

      console.log('response = ' + response.result)
      console.log('Prediction- ' + this.state.prediction)
      await this.addImgToDB()
    } catch (e) {
      console.log("Error in handleUploadPhoto");
      console.log(e)
    }

  }

  

  findCoordinates = async () => {
    try {
      if (Platform.OS == "android") {
        await requestLocationPermission();
      }

      const config = {
        authorizationLevel: "whenInUse",
      }

      await Geolocation.setRNConfiguration(config);
      Geolocation.getCurrentPosition(
        (position) => {
          console.log("find cords" + position);
          this.setState({ location: position });
        },
        error => Alert.alert(error.message),

      );

      console.log("location = " + this.state.location)
      return true
    } catch (e) {
      console.log("Error in findCordinates in ImageSelect.")
      return false
    }

  };

  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  addImgToDB = async () => {
    try {
      await this.findCoordinates()

      await this.timeout(1000)

      

      let datauri = (this.state.photo.uri).split('/');
      const imageinfo = datauri[datauri.length - 1];

      try {
        await RNFS.mkdir(RNFS.DocumentDirectoryPath + '/Realm_db/Images/');
        await RNFS.mkdir(RNFS.DocumentDirectoryPath + '/Realm_db/Database/');
        await RNFS.copyFile(this.state.photo.uri, RNFS.DocumentDirectoryPath + '/Realm_db/Images/' + imageinfo);


        console.log(this.state.photo.uri);
      } catch (e) {
        console.log(e);
        console.log('Error in addImgToDB');
      }

      console.log("waiting")

      console.log("loc " + this.state.location)

      let realm = await Realm.open({
        path: RNFS.DocumentDirectoryPath + '/Realm_db/Database/Crops.realm',
        schema: [cropSchema]
      })

      

      realm.write(async () => {


        let x = this.state.location.coords.latitude
        x = x.toString()
        let y = this.state.location.coords.longitude
        y = y.toString()

        console.log("x " + x + " y " + y);
        let prediction = (this.state.prediction != null) ? this.state.prediction : "Not classified"
        realm.create('Crop', {

          image_uri: 'file://' + RNFS.DocumentDirectoryPath + '/Realm_db/Images/' + imageinfo,
          image_type: this.state.photo.type,
          data_added: new Date(),
          classify: prediction,
          lat: x,
          lon: y,
        })
      })

      if (this.state.prediction != null) {
        alert("Image Classified and saved to Database successfully");
      }
      else {
        alert("Image saved successfully to database");
      }

      this.setState(prevstate => ({
        photo: '',
        prediction: null,
      }))


    } catch (e) {
      console.log(e);
      console.log("Error in addToDB in ImageSelect");
    }

  }




  render() {
    return (
      <Fragment>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <View style={styles.body}>
            <Text style={{ textAlign: 'center', fontSize: 15, paddingBottom: 10 }} >Pick Image from Camera / Gallery</Text>
            <View style={styles.ImageSections}>

              <View>
                {this.renderFileUri()}
                <Text style={{ textAlign: 'center' }}>Preview</Text>
              </View>
            </View>

            <View style={styles.btnParentSection}>
              <TouchableOpacity onPress={this.chooseImage} style={styles.btnSection}  >
                <Text style={styles.btnText}>Choose File</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={this.handleUploadPhoto} style={styles.btnSection}  >
                <Text style={styles.btnText}>Classify Now</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={this.addImgToDB} style={styles.btnSection}  >
                <Text style={styles.btnText}>Save to DATABASE</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.btnParentSection}>
              <Text style={{ textAlign: 'center', fontSize: 12, paddingBottom: 10 }} >Use Save to Database in case of low/no internet connectivity</Text>
            </View>


            <View style={styles.btnParentSection}></View>
            <View style={styles.btnParentSection}></View>

          </View>
        </SafeAreaView>
      </Fragment>
    );
  }
};

const styles = StyleSheet.create({

  body: {
    backgroundColor: "white",
    justifyContent: 'center',
    borderColor: 'black',
    borderWidth: 1,
    height: Dimensions.get('screen').height - 20,
    width: Dimensions.get('screen').width
  },
  ImageSections: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center'
  },
  images: {
    width: 300,
    height: 200,
    borderColor: 'white',
    borderWidth: 1,
    marginHorizontal: 3
  },
  btnParentSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  btnSection: {
    width: 225,
    height: 50,
    backgroundColor: 'powderblue',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    marginBottom: 10
  },
  btnText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 14,
    fontWeight: 'bold'
  }
});