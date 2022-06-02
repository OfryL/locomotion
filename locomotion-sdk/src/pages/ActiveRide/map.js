import React, {
  useState, useEffect, useRef, useContext,
} from 'react';
import {
  StyleSheet, Platform,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import Config from 'react-native-config';
import CheapRuler from 'cheap-ruler';

import { RidePageContext } from './ridePageContext';
import { getPosition } from '../../services/geo';
import {
  VehicleDot, MapButtonsContainer,
} from './styled';
import mapDarkMode from '../../assets/mapDarkMode.json';
import { Context as ThemeContext, THEME_MOD } from '../../context/theme';
import StationsMap from './StationsMap';
import MyLocationButton from '../../Components/ShowMyLocationButton';

export default ({
  mapSettings,
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const mapInstance = useRef();

  const {
    disableAutoLocationFocus,
    setDisableAutoLocationFocus,
    activeRideState,
    activeSpState,
    mapMarkers,
    displayMatchInfo,
    requestStopPoints,
    setRequestStopPoints,
    rideOffer,
    stopAutoStationUpdate,
  } = useContext(RidePageContext);

  const [mapRegion, setMapRegion] = useState({
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });

  const showsUserLocation = !activeRideState || (activeRideState && !activeRideState.stopPoints[0].completedAt);

  const focusMarkers = () => {
    if (!activeRideState) {
      return;
    }
    const activeSp = activeRideState.stopPoints.find(sp => sp.state === 'pending' || sp.state === 'arrived');

    const additional = [];
    if (activeRideState && activeSp.type === 'pickup' && !activeSp.completedAt && mapRegion.latitude && mapRegion.longitude) {
      additional.push({ latitude: mapRegion.latitude, longitude: mapRegion.longitude });
    }

    if (activeRideState.vehicle && activeRideState.vehicle.location && displayMatchInfo) {
      additional.push({
        latitude: parseFloat(activeRideState.vehicle.location.lat),
        longitude: parseFloat(activeRideState.vehicle.location.lng),
      });
    }

    mapInstance.current.fitToCoordinates([
      { latitude: parseFloat(activeSp.lat), longitude: parseFloat(activeSp.lng) },
      ...additional,
    ], {
      edgePadding: {
        top: 80,
        right: 100,
        bottom: 250,
        left: 100,
      },
    });
  };

  const focusCurrentLocation = () => {
    setDisableAutoLocationFocus(false);
    if (mapRegion.longitude && mapRegion.latitude && !activeRideState) {
      mapInstance.current.animateToRegion({
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
        latitudeDelta: mapRegion.latitudeDelta,
        longitudeDelta: mapRegion.longitudeDelta,
      }, 1000);
    } else if (activeRideState && activeRideState.vehicle && activeRideState.vehicle.location) {
      focusMarkers();
    }
  };

  const selectStationMarker = (key) => {
    const station = mapMarkers.find(marker => marker.id === key);
    setRequestStopPoints({
      ...requestStopPoints,
      openEdit: false,
      [requestStopPoints.selectedType]: station,
    });
    stopAutoStationUpdate();
  };

  const VehicleMarker = () => {
    if (activeRideState && activeRideState.vehicle && activeRideState.vehicle.location && displayMatchInfo) {
      let newPoint;
      const { lat, lng } = activeRideState.vehicle.location;
      const fixLat = Number(Number(lat).toFixed(5));
      const fixLng = Number(Number(lng).toFixed(5));
      if (activeSpState && activeSpState.polyline) {
        const ruler = new CheapRuler(fixLat, 'meters');
        const line = activeSpState.polyline.map(t => [t.longitude, t.latitude]);
        newPoint = ruler.pointOnLine(
          line,
          [fixLng, fixLat],
        ).point;
      } else {
        newPoint = [fixLat, fixLng];
      }
      return (
        <Marker coordinate={{ latitude: newPoint[1], longitude: newPoint[0] }}>
          <VehicleDot />
        </Marker>
      );
    }
    return null;
  };

  const initialLocation = async () => {
    try {
      const geoData = await getPosition();
      setMapRegion(oldMapRegion => ({
        ...oldMapRegion,
        ...geoData.coords,
      }));
    } catch (e) {
      console.log('Init location error', e);
    }
  };

  useEffect(() => {
    initialLocation();
  }, []);


  useEffect(() => {
    if (!disableAutoLocationFocus) {
      focusCurrentLocation();
    }
  }, [mapRegion]);

  return (
    <>
      <MapView
        provider={Config.MAP_PROVIDER}
        showsUserLocation={showsUserLocation}
        style={StyleSheet.absoluteFillObject}
        showsMyLocationButton={false}
        loadingEnabled
        showsCompass={false}
        key="map"
        followsUserLocation={!disableAutoLocationFocus}
        moveOnMarkerPress={false}
        onPanDrag={() => (disableAutoLocationFocus === false ? setDisableAutoLocationFocus(true) : null)}
        onUserLocationChange={(event) => {
          if ((Platform.OS === 'ios' && !Config.MAP_PROVIDER !== 'google') || !showsUserLocation || disableAutoLocationFocus) {
            return; // Follow user location works for iOS
          }
          const { coordinate } = event.nativeEvent;

          setMapRegion(oldMapRegion => ({
            ...oldMapRegion,
            ...coordinate,
          }));

          if (!disableAutoLocationFocus) {
            focusCurrentLocation();
          }
        }}
        ref={mapInstance}
        onMapReady={() => {
          // focusCurrentLocation();
          if (Platform.OS === 'ios') {

          }
          /* PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ); */
        }}
        userInterfaceStyle={isDarkMode ? THEME_MOD.DARK : undefined}
        customMapStyle={isDarkMode ? mapDarkMode : undefined}
        {...mapSettings}
      >
        {!activeRideState
          ? (
            <StationsMap
              isInOffer={!!rideOffer}
              markersMap={mapMarkers}
              selectStation={selectStationMarker}
              requestStopPoints={requestStopPoints}
              activeRideState={activeRideState}
            />
          ) : null}

        {activeSpState
          ? (
            <StationsMap
              isInOffer={!!rideOffer}
              markersMap={activeRideState && activeRideState.stopPoints ? activeRideState.stopPoints.map(m => ({
                description: m.description, lat: m.lat, lng: m.lng, type: m.type, id: `active_${m.type}`,
              })) : []}
              selectStation={selectStationMarker}
              requestStopPoints={requestStopPoints}
              activeRideState={activeRideState}
            />
          ) : null}

        {activeSpState && displayMatchInfo
          ? (
            <Polyline
              strokeWidth={3}
              strokeColor="#8ac1ff"
              coordinates={activeSpState.polyline}
            />
          ) : null}
        <VehicleMarker />
      </MapView>
      <MapButtonsContainer>
        <MyLocationButton
          onPress={() => focusCurrentLocation()}
          displayButton
        />
      </MapButtonsContainer>
    </>
  );
};