
import React, { Fragment, Component } from 'react';
import ImagePicker from 'react-native-image-picker';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Image,
  Button,
  Dimensions,
  TouchableOpacity,
  Platform
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import RNFS from 'react-native-fs'
import Realm from 'realm'
import cropSchema from './../storage/realm/cropSchema'

const options = {
    title: 'Select Avatar',
    customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };


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
        photo : null ,
        filepath: {
          data: '',
          uri: ''
        },
        fileData: '',
        fileUri: ''
      }
    }
  
    chooseImage = () => {
      let options = {
        title: 'Select Image',
   //     customButtons: [
   //      { name: 'customOptionKey', title: 'Choose Photo from Custom Option' },
   //     ],
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };
      ImagePicker.showImagePicker(options, (response) => {
        //console.log('Response = ', response);
  
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } 
        //else if (response.error) {
          //console.log('ImagePicker Error: ', response.error);
      //  }
         else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
          alert(response.customButton);
        } else {
          const source = { uri: response.uri };
  
          // You can also display the image using data:
          // const source = { uri: 'data:image/jpeg;base64,' + response.data };
          // alert(JSON.stringify(response));s
          //console.log('response', JSON.stringify(response));
          this.setState({
            filePath: response,
            fileData: response.data,
            fileUri: response.uri,
            photo : response ,
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
        //console.log('Response = ', response);
  
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
          alert(response.customButton);
        } else {
          const source = { uri: response.uri };
          //console.log('response', JSON.stringify(response));
          this.setState({
            filePath: response,
            fileData: response.data,
            fileUri: response.uri,
            photos : response,
          });
        }
      });
  
    }
  
    launchImageLibrary = () => {
      let options = {
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };
      ImagePicker.launchImageLibrary(options, (response) => {
        //console.log('Response = ', response);
  
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
          alert(response.customButton);
        } else {
          const source = { uri: response.uri };
         // console.log('response', JSON.stringify(response));
          this.setState({
            filePath: response,
            fileData: response.data,
            fileUri: response.uri,
            photo : response,
          });

        }
      });
  
    }

    



    handleUploadPhoto = () => {
      fetch("http://192.168.1.203:3000/api/upload", {
        method: "POST",
        body: createFormData(this.state.photo, { userId: "123" })
      })
        .then(response => response.text())
        .then(response => {
          console.log("upload succes", response);
          alert("Upload success!");
          this.setState({ 
            filepath: {
              data: '',
              uri: ''
            },
            fileData: '',
            fileUri: '',
            photo: null });
        })
        .catch(error => {
          console.log("upload error", error);
          alert("Upload failed!");
        });
    };
  
    renderFileData() {
      if (this.state.fileData) {
        return <Image source={{ uri: 'data:image/jpeg;base64,' + this.state.fileData }}
          style={styles.images}
        />
      } else {
        return <Image source={require('./dummy.png')}
          style={styles.images}
        />
      }
    }
  
    renderFileUri() {
      if (this.state.fileUri) {
        return <Image
          source={{ uri: this.state.fileUri }}
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

          
          let m = await RNFS.mkdir(RNFS.DocumentDirectoryPath+'/Realm2/Images/');
          let n = await RNFS.mkdir(RNFS.DocumentDirectoryPath+'/Realm2/Database/');
          let p = await RNFS.copyFile(this.state.photo.uri, RNFS.DocumentDirectoryPath+'/Realm2/Images/'+imageinfo);

          console.log(this.state.photo.uri);

          } catch (e) {
              console.log(e);
              console.log('reee');
          }
     

          let db_all
          let damn = await Realm.open({
              path: RNFS.DocumentDirectoryPath + '/Realm2/Database/Crops.realm',
              schema: [cropSchema]
          }).then(realm => {
              realm.write(() => {
                  const myCrop = realm.create('Crop', {
                      image_uri: 'file://'+RNFS.DocumentDirectoryPath+'/Realm2/Images/'+imageinfo,
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
              <Text style={{textAlign:'center',fontSize:15,paddingBottom:10}} >Pick Image from Camera / Gallery</Text>
              <View style={styles.ImageSections}>
                
                <View>
                  {this.renderFileUri()}
                  <Text style={{textAlign:'center'}}>Preview</Text>
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
              <Text style={{textAlign:'center',fontSize:12,paddingBottom:10}} >Use Save to Database in case of low/no internet connectivity</Text>
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
    scrollView: {
      backgroundColor: Colors.lighter,
    },
  
    body: {
      backgroundColor: Colors.white,
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
      marginTop:10,
    },
    btnSection: {
      width: 225,
      height: 50,
      backgroundColor: 'powderblue',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 3,
      marginBottom:10
    },
    btnText: {
      textAlign: 'center',
      color: 'gray',
      fontSize: 14,
      fontWeight:'bold'
    }
  });