import React, { Component, createRef } from 'react'

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
    Alert,
} from 'react-native'

import RNFS from 'react-native-fs'
import Realm from 'realm'
import cropSchema from './../storage/realm/cropSchema'

import { SwipeListView } from 'react-native-swipe-list-view';
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';

import Icon from 'react-native-vector-icons/Entypo';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';


export default class ViewDB extends Component {

    constructor(props) {
        super(props)
        this.state = {
            dbdata: [],
            isLoading: true,
            modalVisible: false,
            modalObject: { data_added: "" },
            progressModal: {
                visibile: false,
                modalMessage: "",
            },
            count: 0,
            
        }
    }

    componentDidMount = async () => {
        let realm = await Realm.open({
            path: RNFS.DocumentDirectoryPath + '/Realm_db/Database/Crops.realm',
            schema: [cropSchema]
        })

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

        this.props.navigation.setParams({
            classifyAll: this.classifyAll,
            deleteAll: this.deleteAll,
        });

    }


    static navigationOptions = ({ navigation }) => {
        console.log("navigation "+navigation.navigate)
        return {
            headerRight: () => (

                <View style={{ padding: 15 }}>

                    <Menu>
                        <MenuTrigger >
                            <View style={{
                                paddingHorizontal: 10,
                                borderRadius:10,
                            }}
                            >
                                <Icon name="dots-three-vertical" size={Dimensions.get('window').width /30} color="black" />
                            </View>

                        </MenuTrigger>
                        <MenuOptions>

                            <MenuOption onSelect={navigation.getParam('classifyAll')} >
                                <View style={{
                                    paddingVertical: 15,
                                    paddingHorizontal: 10,
                                    flexDirection: "row",
                                    justifyContent: "flex-start",
                                    alignItems: "center"
                                }}>
                                    <Icon name="leaf" size={Dimensions.get('window').width /20}/>
                                    <Text>     Classify All</Text>

                                </View>

                            </MenuOption>


                            {/* <MenuOption onSelect={navigation.getParam('export')}>


                                <View style={{
                                    paddingVertical: 15,
                                    paddingHorizontal: 10,
                                    flexDirection: "row",
                                    justifyContent: "flex-start",
                                    alignItems: "center"
                                }}>
                                    <IconMaterial name="database-export" size={Dimensions.get('window').width /20} />
                                    <Text>     Export</Text>

                                </View>
                            </MenuOption> */}

                            <MenuOption onSelect={navigation.getParam('deleteAll')} >


                                <View style={{
                                    paddingVertical: 15,
                                    paddingHorizontal: 10,
                                    flexDirection: "row",
                                    justifyContent: "flex-start",
                                    alignItems: "center"
                                }}>
                                    <IconMaterial name="delete-outline" size={Dimensions.get('window').width /20} />
                                    <Text>     Delete All</Text>

                                </View>
                            </MenuOption>
                        </MenuOptions>
                    </Menu>
                </View>

            )

        }

    }

    handleClassifyPhoto = async (item) => {

        try {

            this.setState(prevState => ({
                progressModal: {
                    visibile: true,
                    modalMessage: "Classifying ...",
                }
            }))

            var photo = {
                type: item.image_type,
                uri: item.image_uri,
                name: 'uploadImage.png',
            };

            var formData = new FormData();

            formData.append('submit', 'ok');
            formData.append('file', photo);

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

            this.setState(prevState => ({
                progressModal: {
                    visibile: false,
                    modalMessage: "",
                }
            }))


            await this.updateDB(item, prediction)
        } catch (e) {
            console.log("Error in handleUploadPhoto");
            console.log(e)
            return false;
        }

    }

    deleteAll = async () => {

        Alert.alert(
            'Delete All?',
            'Do you want to delete all items?',
            [
              {text: 'Yes', onPress: async () => {
                await Realm.open({
                    path: RNFS.DocumentDirectoryPath + '/Realm_db/Database/Crops.realm',
                    schema: [cropSchema]
                }).then(realm => { 
                    realm.write(() => { realm.deleteAll() }) 
                    console.log('Deleted All')
                    this.componentDidMount()
                });
              }},
            
              {text: 'No', onPress: () => console.log('No Pressed')},
            ],
            {cancelable: false},
          );

          

        
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

        realm.write(() => {
            cropToBeUpdated[0].classify = prediction
        })

        console.log("Done")
        this.componentDidMount()
        return true

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

    toggleProgressModal = () => {
        this.setState(prevState => ({
            progressModal: {
                visibile: !prevState.progressModal.visibile,
                modalMessage: prevState.progressModal.modalMessage,
            }
        }))
    }



    classifyAll = async () => {

        console.log('Classfying')

        const todo = []

        for (let index = 0; index < this.state.dbdata.length; index++) {
            const item = this.state.dbdata[index];
            if (item.classify == "Not classified") {
                todo.push(item)
            }
        }

        for (let index = 0; index < todo.length; index++) {
            const item = todo[index]
            this.setState(prevState => ({
                progressModal: {
                    visibile: true,
                    modalMessage: `Classifying image - ${index + 1}/${todo.length}`,
                }
            }))
            await this.handleClassifyPhoto(item)

        }

        this.setState(prevState => ({
            progressModal: {
                visibile: false,
                modalMessage: "Done",
            }
        }))



    }

    render() {

        if (this.state.isLoading) {
            return (
                <ActivityIndicator style={styles.loading} />
            )
        }

        if (this.state.dbdata.length === 0) {
            return (
                <View style={styles.centeredItem}>
                    <IconMaterial name="image-plus" size={Dimensions.get('window').width / 2} color="#d8d8d8" />
                    <Text style={{ color: "#787878" }}> Database is empty.</Text>
                </View>

            )
        }

        return (

            <SafeAreaView style={{ height: Dimensions.get('window').height }}>

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

                            <TouchableHighlight onPress={() => this.toggleModal(rowData.item)}>
                                <View style={styles.rowStyle}>
                                    <View style={styles.rowStyleInner}>
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

                                    <View style={styles.bottomItem} >
                                        <Icon name="leaf" size={Dimensions.get('window').width / 15} color='black' />
                                    </View>
                                    <View style={styles.topItem} >
                                        <Text>Classify</Text>
                                    </View>


                                </TouchableOpacity>
                            </View>


                            <View style={styles.delete}>
                                <TouchableOpacity
                                    onPress={() => this.deleteRow(rowData.item, rowMap, rowData.item.key)}
                                >
                                    <View style={styles.bottomItem} >
                                        <Icon name="trash" size={Dimensions.get('window').width / 15} color='black' />
                                    </View>
                                    <View style={styles.topItem} >
                                        <Text>Delete</Text>
                                    </View>


                                </TouchableOpacity>
                            </View>

                        </React.Fragment>


                    )}

                    disableRightSwipe={true}
                    rightOpenValue={-2 * Dimensions.get('window').width / 5}
                    previewRowKey={'0'}
                    previewOpenValue={-Dimensions.get('window').width / 10}
                    previewOpenDelay={2000}
                />

                <View style={[styles.centeredItem, this.state.progressModal.visibile ? {} : { display: "none" }]}>
                    <View style={styles.loadingModal}>

                        <Text>{this.state.progressModal.modalMessage}</Text>

                    </View>
                </View>

                <View style={{height:80, width:Dimensions.get('window').width}}>
                    <Text>_</Text>
                </View>

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
        paddingBottom: 1,
        backgroundColor: "#f2f2f2",
    },

    rowStyleInner: {
        justifyContent: "center",
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'white',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        paddingBottom: 1,
        marginTop: 10,
        marginHorizontal: 10,

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
        alignItems: 'center',
    },

    topItem: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    bottomItem: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },

    delete: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        right: 0,
        bottom: 0,
        top: 0,
        width: Dimensions.get('window').width / 5,
    },

    classify: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'space-around',
        right: Dimensions.get('window').width / 5,
        bottom: 0,
        top: 0,
        width: Dimensions.get('window').width / 5,
        flex: 1,
        textAlign: 'center'

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
    },

    hiddenImage: {
        flex: 3,
        height: Dimensions.get('window').width / 10,
        width: Dimensions.get('window').width / 10,
    },

    loadingModal: {

        position: "absolute",

        alignItems: 'center',
        justifyContent: 'center',

        bottom: Dimensions.get('window').height / 8,

        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').height / 10,
        backgroundColor: 'lightgray',
        borderRadius: 10,
    },

})

