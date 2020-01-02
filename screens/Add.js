import React, { Component } from 'react'
import { View, Text, Button, FlatList, Image, ActivityIndicator } from 'react-native'
import RNFS from 'react-native-fs'
import Realm from 'realm'
import cropSchema from './../storage/realm/cropSchema'

class Add extends Component {

    constructor(props) {
        super(props)
        this.state = {
            imageuri: "No",
            imagepicked: false,
            imagecopied: false,
            dbdata: [],
            isLoading:true,
        }


    }


    resetState = () => {
        this.setState(previousState => ({
            imageuri: "No",
            imagepicked: false,
            imagecopied: false,
            dbdata: [],
            isLoading:true,
        }
        ))
    }


    // used for select file button, saves uri, base64 data to state
    componentDidMount = async () => {


        let qp = await Realm.open({
            path: RNFS.DocumentDirectoryPath + '/Realm2/Database/Crops.realm',
            schema: [cropSchema]
        }).then(realm => {
           
            this.setState({
                dbdata : realm.objects('Crop')
            });
            console.log(this.state.dbdata)
            this.setState({
                isLoading:false
            })
        })

    }


    render() {


        if(this.state.isLoading){
            return(
                <ActivityIndicator style={{ flex: 1, justifyContent: "center", height: "100%", width: "100%" }} />
            )
        } else {
            let bruh = [];
            let p = 0;

            for (let i of this.state.dbdata) {


                i.id = p.toString();
                p += 1;

                bruh.push(i);
                console.log(i.image_uri);
            }

            return (

                <View style={{ flex: 1, justifyContent: "center", height: "100%", width: "100%" }}>
                    <Button
                        title="Back"
                        onPress={this.resetState}
                    />
                    <FlatList
                        data={bruh}
                        renderItem={({ item }) => (
    
                            <View style={{ paddingVertical: 20, flex: 1 }}>
                                <Image
                                    style={{ width: 50, height: 50, margin: 1, flex: 1 }}
                                    source={{ uri: item.image_uri }}
    
    
    
                                />
    
                                <Text style={{ flex: 1 }}>{item.classify}</Text>
                            </View>
    
                        )}
                        keyExtractor={item => item.id}
    
    
                    />

    
                </View>
    
            )
    



        }

        
        
        // dbdata = Realm.objects('crop');
        




    }




}


export default Add