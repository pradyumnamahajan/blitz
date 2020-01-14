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
            modalObject: { data_added: "" },
        }
    }

    //Loads images from database
    componentDidMount = async () => {
        let realm = await Realm.open({
            path: RNFS.DocumentDirectoryPath + '/Realm_db/Database/Crops.realm',
            schema: [cropSchema]
        })


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

    }


    // {"classify": "Not classified", "data_added": 2020-01-13T19:02:15.572Z, "image_type": "image/jpeg", "image_uri": "file:///Users/manasimahajan/Library/Developer/CoreSimulator/Devices/0A43928B-D8CE-4E95-9DC2-E5589A4EE4B3/data/Containers/Data/Application/0359F365-4AA6-4D4D-B846-BAF538C3FA43/Documents/Realm_db/Images/185B0C6A-E3B0-446D-911A-AD99EB3F5668.jpg", "key": "1", "lat": "37.785834", "lon": "-122.406417"}

    /* Update tgis shit lat long */
    handleClassifyPhoto = async (item) => {

        try {
            var photo = {
                type: item.image_type,
                uri: item.image_uri,
                name: 'uploadImage.png',
            };

            var formData = new FormData();

            formData.append('submit', 'ok');
            formData.append('file', photo);
            // await fetch("http://blitz-crop-app.appspot.com/analyze", {
            //     "credentials": "omit",
            //     "headers": {
            //         "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:72.0) Gecko/20100101 Firefox/72.0",
            //         "Accept": "*/*",
            //         "Accept-Language": "en-US,en;q=0.5",
            //         "Content-Type": "multipart/form-data; boundary=---------------------------129344616721202538351910050174"
            //     },
            //     "referrer": "http://blitz-crop-app.appspot.com/",

            //     "method": "POST",
            //     "mode": "cors"
            // });

            console.log("sending request")
            let response = await fetch("https://blitz-crop-app.appspot.com/analyze", {
                method: "POST",
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            })


            console.log("received response")

            let responseJSON = await response.json()
            console.log(responseJSON)
            let prediction = responseJSON.result.toString()



            //     prediction: responseJSON.result,
            //   });

            //   console.log('response = ' + response.result)
            //   console.log('Prediction- ' + this.state.prediction)
            await this.updateDB(item, prediction)
        } catch (e) {
            console.log("Error in handleUploadPhoto");
            console.log(e)
            return false;
        }

    }


    updateDB = async (item, prediction) => {
        console.log("Updating DB")

        let realm = await Realm.open({
            path: RNFS.DocumentDirectoryPath + '/Realm_db/Database/Crops.realm',
            schema: [cropSchema]
        })

        var cropToBeUpdated = realm
            .objects('Crop')
            .filtered('image_uri = "' + item.image_uri + '"')

        
        console.log(cropToBeUpdated[0])

        realm.write(()=> {
            cropToBeUpdated[0].classify=prediction
        })
        
        console.log("Done")
        //Not very proud of this line, but it works
        this.componentDidMount()

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
        const newData = [...this.state.dbdata]
        const prevIndex = this.state.dbdata.findIndex(
            item => item.key === rowKey
        );
        newData.splice(prevIndex, 1);
        this.setState({ dbdata: newData })
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
                                style={{ height: Dimensions.get('window').height }}
                                visible={this.state.modalVisible}
                                onRequestClose={() => this.toggleModal(rowData.item)}
                            >
                                <SafeAreaView style={{ height: Dimensions.get('window').height }}>
                                    <Image
                                        style={styles.modalStyle}
                                        source={{ uri: this.state.modalObject.image_uri }}

                                    />

                                    <Text style={styles.modalText}>
                                        Classification: {this.state.modalObject.classify}
                                    </Text>

                                    {console.log(this.state.modalObject.data_added)}
                                    <Text style={styles.modalText}>
                                        Added on: {this.state.modalObject.data_added.toString().replace(' ', ', ')}
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
                            <TouchableHighlight onPress={() => this.toggleModal(rowData.item)}>

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

                        </React.Fragment>
                    )}

                    renderHiddenItem={(rowData, rowMap) => (

                        <React.Fragment>
                            <View style={styles.classify}>
                                <TouchableOpacity 
                                    onPress={() => this.handleClassifyPhoto(rowData.item)}
                                >
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
        resizeMode: "contain",
        backgroundColor: "black",
        height: '50%',
        width: '100%',
    },

    modalText: {
        fontSize: Dimensions.get("window").width / 20,
        margin: 5
    }

})

