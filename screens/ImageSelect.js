
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
  Platform
} from 'react-native';



import RNFS from 'react-native-fs'
import Realm from 'realm'
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


export default class ImageSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      photo: '',
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

  launchCamera = () => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        alert(response.customButton);
      } else {
        this.setState({
          photo: response,
        });
      }
    });

  }

  
  handleUploadPhoto = () => {
    fetch("http://blitz-crop-app.appspot.com/analyze", {
      method: "POST",
      body: createFormData(this.state.photo, { userId: "123" })
    })
      .then(response => response.text())
      .then(response => {
        console.log(response)
        console.log("upload succes", response);
        alert("Upload success!");
        this.setState({
          photo: ''
        });
      })
      .catch(error => {
        console.log("upload error", error);
        alert("Upload failed!");
      });
  };


  renderFileUri() {
    if (this.state.photo.uri) {
      return <Image
        source={{ uri: this.state.photo.uri }}
        style={styles.images}
      />
    } else {
      return <Image
        source={require('./dummy.png')}
        style={styles.images}
      />
    }
  }

  addImgToDB = async () => {
    try {

      let datauri = (this.state.photo.uri).split('/');
      const imageinfo = datauri[datauri.length - 1];

      try {
        await RNFS.mkdir(RNFS.DocumentDirectoryPath + '/Realm_db/Images/');
        await RNFS.mkdir(RNFS.DocumentDirectoryPath + '/Realm_db/Database/');
        await RNFS.copyFile(this.state.photo.uri, RNFS.DocumentDirectoryPath + '/Realm_db/Images/' + imageinfo);

        console.log(this.state.photo.uri);
      } catch (e) {
        console.log(e);
        console.log('reee');
      }


      await Realm.open({
        path: RNFS.DocumentDirectoryPath + '/Realm_db/Database/Crops.realm',
        schema: [cropSchema]
      }).then(realm => {
        realm.write(() => {
          const myCrop = realm.create('Crop', {
            image_uri: 'file://' + RNFS.DocumentDirectoryPath + '/Realm_db/Images/' + imageinfo,
            data_added: new Date(),

          })
        })

        alert("Image saved successfully to database");

      })

    } catch (e) {
      console.log(e);
      console.log("Error in db");
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