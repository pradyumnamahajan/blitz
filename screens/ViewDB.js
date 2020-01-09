import React, { Component } from 'react'
import { View, 
         Text,
         Image, 
         ActivityIndicator, 
         Dimensions, 
         StyleSheet, 
         TouchableOpacity 
        } from 'react-native'

import RNFS from 'react-native-fs'
import Realm from 'realm'
import cropSchema from './../storage/realm/cropSchema'

import { SwipeListView } from 'react-native-swipe-list-view';


export default class ViewDB extends Component {

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

                if (i.isValid()) {
                    i.key = p.toString()
                    p += 1
                    image_data_array.push(i)

                }

            }

            this.setState(prevState => ({
                dbdata: image_data_array,
                isLoading: false
            }));

           

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

    render(){

        if(this.state.isLoading) {
            return(
                <ActivityIndicator style={styles.loading} />
            )
        }

        return (
            <SwipeListView
                useFlatList={true}
                data = {this.state.dbdata}
                
                renderItem = { (rowData, rowMap) => (
                    // rowData jas two objects - item and an unknown object,
                    // the item object is the same one from flatlist
                    // just use it ignoring the other object

                    <View style={styles.rowStyle}>
                        <Image 
                            style={styles.previewImage}
                            source={{ uri: rowData.item.image_uri }}
                        />
                        {console.log(rowData.item)}
                        <View style={styles.centeredItem}>
                            <Text>
                                {rowData.item.classify}        
                            </Text>
                        </View>
                        
                    </View>
                )}

                renderHiddenItem={ (rowData, rowMap) => (
                    
                    <React.Fragment>
                        <View style={styles.classify}>
                            {/* <TouchableOpacity 
                                onPress = { () => this.deleteRow(rowData.item, rowMap, rowData.item.key)}
                                // onPress={ _ => rowMap[rowData.item.key].closeRow() }
                            > */}
                            <Text>Classify</Text>
                            {/* </TouchableOpacity> */}
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

                rightOpenValue={-2*Dimensions.get('window').width / 5}
                // onRowOpen={(rowKey, rowMap) => {
                //     setTimeout(() => {
                //         rowMap[rowKey].closeRow()
                //     }, 5000)
                // }}

            />
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
        justifyContent:"center",
        flex:1,
        flexDirection:'row',
        backgroundColor:'white',
    },

    previewImage: { 
        flex:1, 
        
        width: Dimensions.get('window').width / 3, 
        height: Dimensions.get('window').width / 3, 
        margin: 1
    },

    centeredItem: {
        flex:1, 
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
    }

})

