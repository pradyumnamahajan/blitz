import React, { Component } from 'react'

import {
    View,
    Text,
    Image,
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Button,
    SafeAreaView,
    TouchableHighlight,
} from 'react-native'

import RNFS from 'react-native-fs'
import Realm from 'realm'
import cropSchema from './../storage/realm/cropSchema'

import { SwipeListView } from 'react-native-swipe-list-view';
//import { TouchableNativeFeedback, TouchableWithoutFeedback } from 'react-native-gesture-handler'      

// {"classify": "Not classified", "data_added": 2020-01-11T16:56:45.317Z, "image_uri": "file:///Users/manasimahajan/Library/Developer/CoreSimulator/Devices/0A43928B-D8CE-4E95-9DC2-E5589A4EE4B3/data/Containers/Data/Application/43C4C281-61BB-4DFF-9E57-3616D37E1138/Documents/Realm_db/Images/45211DEC-3757-4B8D-98C4-8CF088DA5430.jpg", "key": "2", "lat": null, "lon": null}


export default class ViewDB extends Component {

    constructor(props) {
        super(props)
        this.state = {
            dbdata: [],
            isLoading: true,
            modalVisible: false,
            modalObject: {data_added:""},
        }
    }

    //Loads images from database
    componentDidMount = async () => {
        let qp = await Realm.open({
            path: RNFS.DocumentDirectoryPath + '/Realm_db/Database/Crops.realm',
            schema: [cropSchema]
        }).then(realm => {

            //Added this part in component did mount instead of render, 
            //might have to add componentDid Update in case of bugs

            let image_data_array = []
            let p = 0


            for (let i of realm.objects('Crop')) {

                i.key = p.toString()
                p += 1
                image_data_array.push(i)

            }

            this.setState(prevState => ({
                dbdata: image_data_array,
                isLoading: false
            }));



        })
    }

    updateDB = () => {

    }
    

    /* Update tgis shit lat long */
    handleUploadPhoto = async () => {
        console.log('type ' + this.state.photo.uri.toString())
        var photo = {
            type: this.state.photo.type,
            uri: this.state.photo.uri,
            name: 'uploadImage.png',
        };



        var formData = new FormData();

        formData.append('submit', 'ok');
        formData.append('file', photo);

        //console.log(formData['file']);

        await fetch("https://blitz-crop-app.appspot.com/analyze", {
            method: "POST",
            headers: {
                //Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        })
            .then(async response => {
                console.log('response ' + response)
                return response.json()
            })
            .then(async response => {
                console.log(response)

                this.setState({
                    prediction: response.result,
                });

                console.log('response = ' + response.result)
                console.log('Prediction- ' + this.state.prediction)
                await this.updateDB()


            })
            .catch(error => {
                console.log("upload error", error)
                alert("Upload failed!")
            })
    }

    deleteRow = async (item, rowMap, rowKey) => {
        await Realm.open({
            path: RNFS.DocumentDirectoryPath + '/Realm_db/Database/Crops.realm',
            schema: [cropSchema]
        }).then(realm => {

            realm.write(
                () => {
                    realm.delete(item)
                }
            )
        })

        rowMap[rowKey].closeRow()
        const newData = [...this.state.dbdata];
        const prevIndex = this.state.dbdata.findIndex(
            item => item.key === rowKey
        );
        newData.splice(prevIndex, 1);
        this.setState({ dbdata: newData });
    }

    toggleModal = (item) => {
        this.setState(prevState => ({
            modalObject: item,
            modalVisible: !this.state.modalVisible,
        }))
    }

    render() {

        if (this.state.isLoading) {
            return (
                <ActivityIndicator style={styles.loading} />
            )
        }

        return (
            <SafeAreaView>
                <SwipeListView
                    useFlatList={true}
                    data={this.state.dbdata}

                    renderItem={(rowData, rowMap) => (
                        // rowData jas two objects - item and an unknown object,
                        // the item object is the same one from flatlist
                        // just use it ignoring the other object


                        <React.Fragment >


                            <Modal
                                visible={this.state.modalVisible}
                                onRequestClose={this.toggleModal}
                            >
                                <SafeAreaView style={{height:'100%'}}>
                                    <Image
                                        style={styles.modalStyle}
                                        source={{ uri: this.state.modalObject.image_uri }}
                                        
                                    />
                                    
                                    <Text style={styles.modalText}>
                                        Classification: {this.state.modalObject.classify}
                                    </Text>

                                    {console.log(this.state.modalObject.data_added)}
                                    <Text style={styles.modalText}>
                                        Added on: {this.state.modalObject.data_added.toString().replace(' ',', ')}
                                    </Text>
                                    <Text style={styles.modalText}>
                                        Latitude: {this.state.modalObject.lat}
                                    </Text>
                                    <Text style={styles.modalText}>
                                        Longitude: {this.state.modalObject.lon}
                                    </Text>

                                    <Button
                                        onPress={() => this.toggleModal(rowData.item)}
                                        title="Go Back!"
                                    />
                                </SafeAreaView>
                                

                            </Modal>


                            {/* <View style={{backgroundColor:'white'}}> */}
                            <TouchableHighlight  onPress={() => this.toggleModal(rowData.item)}>
                                
                                <View style={styles.rowStyle}>
                                    {console.log(rowData.item)}
                                    <Image
                                        style={styles.previewImage}
                                        source={{ uri: rowData.item.image_uri }}
                                    />

                                    <View style={styles.centeredItem}>
                                        <Text>
                                            {rowData.item.classify}
                                        </Text>
                                    </View>


                                </View>

  

                            </TouchableHighlight>


                            {/* </View> */}
                            
                        </React.Fragment>
                    )}

                    renderHiddenItem={(rowData, rowMap) => (

                        <React.Fragment>
                            <View style={styles.classify}>
                                <TouchableOpacity >
                                    <Text>Classify</Text>
                                </TouchableOpacity>
                            </View>


                            <View style={styles.delete}>
                                <TouchableOpacity
                                    onPress={() => this.deleteRow(rowData.item, rowMap, rowData.item.key)}
                                >
                                    <Text>Delete</Text>
                                </TouchableOpacity>
                            </View>

                        </React.Fragment>


                    )}

                    disableRightSwipe={true}

                    rightOpenValue={-2 * Dimensions.get('window').width / 5}
                    previewRowKey={'0'}
                    previewOpenValue={-Dimensions.get('window').width / 10}


                    previewOpenDelay={2000}

                /* This can be Enabled if we want Row to close after some time */
                // onRowOpen={(rowKey, rowMap) => {
                //     setTimeout(() => {
                //         rowMap[rowKey].closeRow()
                //     }, 5000)
                // }}

                />

            </SafeAreaView>

        )
    }


}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: "center",
        height: "100%",
        width: "100%"
    },

    rowStyle: {
        justifyContent: "center",
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'white',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        paddingBottom: 1,
    },

    previewImage: {
        flex: 1,

        width: Dimensions.get('window').width / 3,
        height: Dimensions.get('window').width / 3,
        margin: 1
    },

    centeredItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    delete: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        right: 0,
        bottom: 0,
        top: 0,
        width: Dimensions.get('window').width / 5,
        backgroundColor: 'red',
    },

    classify: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        right: Dimensions.get('window').width / 5,
        bottom: 0,
        top: 0,
        width: Dimensions.get('window').width / 5,
        backgroundColor: '#31ca31',
    },

    modalStyle: {
        resizeMode:"contain",
        backgroundColor:"black",
        height: '50%',
        width: '100%', 
    },

    modalText: {
        fontSize: Dimensions.get("window").width/20,
        margin: 5
    }

})

