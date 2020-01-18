import React, { Component } from 'react'
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Alert } from 'react-native'
import RNFS from 'react-native-fs'
import Realm from 'realm'
import cropSchema from './../storage/realm/cropSchema'
// import Swipeout from 'react-native-swipeout';
// import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
// import { TouchableHighlight } from 'react-native-gesture-handler';
// import { TabHeading } from 'native-base';
import Mailer from 'react-native-mail';
// import GDrive from 'react-native-google-drive-api-wrapper';
// import {  statusCodes,GoogleSigninButton } from '@react-native-community/google-signin';
// import GoogleSignIn from 'react-native-google-sign-in';
//import Share from 'react-native-share';
// import { TouchableOpacity  } from 'react-native-gesture-handler'

const { Parser } = require('json2csv');

class ExportPage extends Component{
    constructor(props) {
        super(props)
        this.state = {
           userInfo : '',
           accessToken : '',
           uri : '',
           cloud_url : '',
           message: '',
        }
    }

    
    _exportPref = async () => {
        console.log('you pressed me');
       let a = await Realm.open({
           path: RNFS.DocumentDirectoryPath + '/Realm_db/Database/Crops.realm',
           schema: [cropSchema]
       }).then( async (realm) =>{
           console.log("hi");
           var currentdate = new Date();
           var datetime = currentdate.getDate()+"-"+(currentdate.getMonth()+1)+"-"+currentdate.getFullYear()+"_"+
                          currentdate.getHours()+"-"+currentdate.getMinutes()+"-"+currentdate.getSeconds();
           
           var json_str = JSON.parse(JSON.stringify(realm.objects('Crop')));
           console.log(json_str)
           var fjson = [{}]
           var id = 0;
           while(json_str[id]  != undefined)
           {
              let x = json_str[id]
              console.log(x.image_uri)
              this.setState({
                uri : x.image_uri,
                cloud_url : '',
              })

              this.setState({
                message: "Backing up image number "+ id.toString()
              })
              let a = await this.handleUploadPhoto()
              
              await this.timeout(5000)

              x['cloud_url'] = this.state.cloud_url
              console.log(x)
              fjson.push(json_str[id])
              id++;
            
              
           
           }
           console.log(fjson)

           this.setState({
             message:'Uploading Done'
           })
           
           //const labels = ['classify','data_added','image_uri','lat','lon'];
           const fields = [{
             
             label: 'Crop Name',
             value: 'classify'
           },
           {
             
             label: 'Image Details',
             value: 'data_added'
           },
           {
               
               label : 'image URI',
               value:'cloud_url'
           },
           {
               value:'lat',
               label : 'Latitude'
           },
           {
               value:'lon',
               label: 'Longitude'
           }
         ];
           
 
            this.setState({
              message: 'Making CSV'
            })

           const json2csvparser = new Parser({fields})
           const csv = json2csvparser.parse(fjson);
           console.log(csv);
           
           RNFS.writeFile(RNFS.ExternalDirectoryPath+'/Name_'+datetime+'.csv',csv,'utf8')
           .then(async () => {
             console.log("Saved");
             this.setState({
                 csv_url : RNFS.ExternalDirectoryPath+'/Name_'+datetime+'.csv'
             });
             console.log(this.state.csv_url);

             await this.timeout(1000)
             this.handleEmail();
           }).catch((err) => {
             console.log(err.message);
            });
       } 
           
       )
     }
    
     handleEmail = () => {
        var currentdate = new Date();

        Mailer.mail({
          subject: 'CSV database file',
          recipients: [],//'siddheshsovitkar@gmail.com','prad.greatt@gmail.com'
          ccRecipients: [],
          bccRecipients: [],
          body: '<b>This is a system generated mail containing your exported database .csv file, please dont reply to this mail.</b>',
          isHTML: true,
          attachment: {
            path: this.state.csv_url,  // The absolute path of the file from which to read data.
            type: 'csv',   // Mime Type: jpg, png, doc, ppt, html, pdf, csv
            name: 'CSV_data_file : created at : '+currentdate.getDate().toString(),   // Optional: Custom filename for attachment
          }
        }, (error, event) => {
          Alert.alert(
            error,
            event,
            [
              {text: 'Ok', onPress: () => console.log('OK: Email Error Response')},
              {text: 'Cancel', onPress: () => console.log('CANCEL: Email Error Response')}
            ],
            { cancelable: true }
          )
        });

        this.setState({
          message:""
        })
      }

      // open_db = async () => {
      //     let a = await Realm.open({
      //         path: RNFS.DocumentDirectoryPath + '/Realm_db/Database/Crops.realm',
      //         schema: [cropSchema]
      //     }).then((realm) =>{
      //      let data = realm.objects('Crop')
      //      console.log(data)
           
      //     })
      // }



      timeout(ms){
        return new Promise(resolve=> setTimeout(resolve,ms));
      }


      handleUploadPhoto = async () => {

        const image = {
          //uri : "./dummy.png",
          uri: this.state.uri,
          type: 'image/png',
          name: 'myImage' + '-' + Date.now() + '.png'
        }
       // console.log(photo);
  
        var formData = new FormData(); 
  
        formData.append('submit','ok');
        formData.append('image', image);
  
        console.log("formdata = " + formData);
  
        fetch("http://192.168.43.12:3000/upload", { //192.168.43.12 192.168.43.12
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          body: formData ,
        }).then( (res) => 
          res.json()
          ).then(res=>{
          console.log(res)
          this.setState({
            uri : '',
            cloud_url : res.imageUrl,
          })
        }).catch(error => {
            console.log("upload error", error);
            alert("Upload failed!");
          });
      };


      // shareCsv = () => {
      //   let t = "file://"+ this.state.csv_url
      //   const options = {
      //     url : t,
      //     type : 'csv',
      //     email : 'siddheshsovitkar@gmail.com',
      //     showAppsToView : true,
      //     message : 'Share .csv',
      //     filename : 'data.csv '
      //   }
      //   Share.open(options)
      //   .then((res) => { console.log(res) })
      //   .catch((err) => { err && console.log(err); });

      // }
      /*signIn = async () => {
       
        
            GoogleSignIn.signInPromise().then((user)=>{
            console.log(user);
              this.setState({
                accessToken : user.accessToken,
              })
              
          }).then(()=>{
              this.open_db()
          }).catch(
           (err) => {
             console.log("error in signin");
           }
          )
         

       
      };

      init_drive = () =>{


      }
      componentWillMount(){
        //GoogleSignIn.hasPlayServices()
        GoogleSignIn.configure({
          scopes: ['https://www.googleapis.com/auth/drive.appdata'],
          shouldFetchBasicProfile: true,
          forceConsentPrompt: true,
          webClientId : "667834510826-ulei0o6779rd6rcjufs8me6corfkbm4d.apps.googleusercontent.com"
        })
      }
     */
     
    render(){
        return(

                <View  style={styles.centeredItem}>
                    {/* <Button title = "Export .csv to Mail" onPress = {()=>{ this._exportPref()}} style={styles.buttonText}/> */}

                    <TouchableOpacity onPress = {()=>{ this._exportPref()}} style={styles.button}>
                      <Text style={styles.buttonText}>
                      Export .csv to Mail
                      </Text>
                    
                    </TouchableOpacity>

                    <Text>
                      {this.state.message}
                    </Text>
                      {/* <Button
                        title = 'Share'
                        onPress={this.shareCsv}
                         /> */}
                </View>

        )
    }

}

const styles = StyleSheet.create({
    mainview : {
        backgroundColor: 'white',
        justifyContent: 'center',
        borderColor: 'black',
        borderWidth: 1,
        height: Dimensions.get('screen').height - 20,
        width: Dimensions.get('screen').width
    },
    btnParentSection: {
        alignItems: 'center',
        marginTop:10,
    },

    button: {
    
      width: Dimensions.get('window').width/1.5,
      height: Dimensions.get('window').width /10,
      backgroundColor:'white',
      borderRadius: 20,
      justifyContent: "center",
      margin: 5,
      // borderWidth:2,
      // borderColor:'black',
      backgroundColor:'white'
  
    },
  
    buttonText: {
      textAlign: 'center',
      fontFamily: "Arial Rounded MT Bold",
      color:"black",
      fontWeight:'bold',
     
    },

    centeredItem: {
      flex:1,
      justifyContent:'center',
      alignItems:'center',
    }
})






export default ExportPage;