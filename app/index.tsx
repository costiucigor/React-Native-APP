import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity, Text, PermissionsAndroid} from 'react-native';
import MapView, {Polyline} from 'react-native-maps';

const MapScreen = () => {
    const [coordinates, setCoordinates] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [region, setRegion] = useState(null);
    const [locationPermission, setLocationPermission] = useState('');

    useEffect(() => {
        const requestLocationPermission = async () => {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'This app needs access to your location',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    setLocationPermission('Location permission granted');
                } else {
                    setLocationPermission('Location permission denied');
                }
            } catch (err) {
                console.warn(err);
            }
        };
        navigator.geolocation.getCurrentPosition(
            position => {
                const {latitude, longitude} = position.coords;
                setRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
            },
            error => console.log(error),
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
        )
        let watchId;
        if (isRecording) {
            watchId = navigator.geolocation.watchPosition(
                position => {
                    const {latitude, longitude} = position.coords;
                    setCoordinates(coords => [...coords, {latitude, longitude}]);
                },
                error => console.log(error),
                {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
            );
        };
        requestLocationPermission();
        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [isRecording]);

    if (!region) {
        return <Text>Loading...</Text>;
    }

    const handleStartRecording = () => {
        setIsRecording(true);
    };

    const handleStopRecording = () => {
        setIsRecording(false);
    };

    return (
        <View style={{flex: 1}}>
            <Text>{locationPermission}</Text>
            <MapView
                style={{flex: 1}}
                initialRegion={region}>
                <Polyline coordinates={coordinates} strokeColor="#000" strokeWidth={6}/>
            </MapView>
            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                {isRecording ? (
                    <TouchableOpacity onPress={handleStopRecording}>
                        <Text style={{fontSize: 20, color: 'red'}}>Stop</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleStartRecording}>
                        <Text style={{fontSize: 20, color: 'green'}}>Start</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default MapScreen;