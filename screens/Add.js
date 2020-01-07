import React, { Component } from 'react'
import { View, Text, Button, FlatList, Image, ActivityIndicator, Dimensions, StyleSheet, Alert } from 'react-native'
import RNFS from 'react-native-fs'
import Realm from 'realm'
import cropSchema from './../storage/realm/cropSchema'

import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import { TouchableHighlight } from 'react-native-gesture-handler'
//import { SwipeRow } from 'native-base'

class Add extends Component {

    constructor(props) {
        super(props)
        this.state = {
            imageuri: "No",
            imagepicked: false,
            imagecopied: false,
            dbdata: [],
            isLoading: true,
            data_list: null,
        }
    }


    resetState = () => {
        this.setState(previousState => ({
            imageuri: "No",
            imagepicked: false,
            imagecopied: false,
            dbdata: [],
            isLoading: true,
            data_list: null,
        }
        ))
    }


    //Loads images from database
    componentDidMount = async () => {
        let qp = await Realm.open({
            path: RNFS.DocumentDirectoryPath + '/Realm_db/Database/Crops.realm',
            schema: [cropSchema]
        }).then(realm => {

            this.setState({
                dbdata: realm.objects('Crop')
            });

            this.setState({
                isLoading: false
            });

        })

    }


    //Alert shown while deleting
    del_alert = async (image_object) => { 
        Alert.alert(
            'Alert',
            '   Are you sure you want to delete?',
            [

                {
                    text: 'Yes', onPress: async () => {

                        let qs = await Realm.open({
                            path: RNFS.DocumentDirectoryPath + '/Realm_db/Database/Crops.realm',
                            schema: [cropSchema]
                        }).then(realm => {

                            realm.write(
                                () => {
                                    realm.delete(image_object)
                                }
                            )

                            console.log('deleted succesfully')
                            alert('Item deleted successfully')
                            this.setState({
                                dbdata: realm.objects('Crop')
                            })

                        }).catch(error => {
                            console.log(error);
                            alert('Error deleting the item, Please try again');
                        })
                    }
                },

                {
                    text: 'No', onPress: () => {
                        console.log(image_object.image_uri) // Is this needed?
                        //this.props.
                    }, style: 'cancel'
                },

            ],
            { cancelable: true }
        );
    }


    render() {

        if (this.state.isLoading) {
            return (
                <ActivityIndicator style={{ flex: 1, justifyContent: "center", height: "100%", width: "100%" }} />
            )
        } else {

            let image_data_array = [];
            let p = 0;

            for (let i of this.state.dbdata) {

                if (i.isValid()) {
                    i.id = p.toString();
                    console.log(i.id)
                    p += 1
                    image_data_array.push(i);
                    console.log(i.image_uri);
                }

            }


            console.log(image_data_array)

            return (

                <View style={styles.container}>

                    <FlatList
                        data={image_data_array}
                        renderItem={({ item }) => (

                            <View style={styles.standalone}>
                                <SwipeRow leftOpenValue={75} rightOpenValue={-75} disableRightSwipe={true} preview={true} closeOnRowOpen={true} >


                                    <TouchableHighlight onPress={() => { this.del_alert(item) }} style={styles.highlight} >
                                        <View style={styles.standaloneRowBack} >
                                            <View>
                                                <Text></Text>
                                                <Text>Delete</Text>
                                            </View>

                                        </View>
                                    </TouchableHighlight>





                                    <View style={styles.standaloneRowFront}>
                                        <Image
                                            style={{ width: 50, height: 50, margin: 1, flex: 1 }}
                                            source={{ uri: item.image_uri }}
                                        />

                                        <Text style={{ flex: 1 }}>{item.classify}</Text>
                                    </View>
                                </SwipeRow>
                            </View>



                        )}
                        keyExtractor={item => item.id}
                        extraData={this.state.dbdata}

                    />

                </View>

            )

        }

    }

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
    },
    standalone: {

        height: 100,
    },
    highlight: {
        height: 100,
    },

    standaloneRowFront: {
        alignItems: 'flex-start',
        backgroundColor: 'white',
        //justifyContent: 'center',
        alignSelf: 'stretch',
        height: 100,
    },
    standaloneRowBack: {
        alignItems: 'flex-end',
        backgroundColor: 'orange',
        flex: 1,
        //flexDirection: 'row',
        //justifyContent: 'space-between',
        alignSelf: 'stretch',
        padding: 15,
        height: 100,
    },
    backTextWhite: {
        color: '#FFF',
    },
    rowFront: {
        alignItems: 'center',
        backgroundColor: '#CCC',
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        justifyContent: 'center',
        height: 50,
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#DDD',
        flex: 1,
        flexDirection: 'row',
        //justifyContent: 'space-between',
        paddingLeft: 15,
    },
    backRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 75,
    },
    backRightBtnLeft: {
        backgroundColor: 'blue',
        right: 75,
    },
    backRightBtnRight: {
        backgroundColor: 'red',
        right: 0,
    },
    controls: {
        alignItems: 'center',
        marginBottom: 30,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 5,
    },
    switch: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'black',
        paddingVertical: 10,
        width: 100,
    },
});


export default Add