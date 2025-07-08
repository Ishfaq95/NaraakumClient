import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Header from '../components/common/Header';
import MapTab from '../components/LocationTabs/MapTab';
import SavedAddresses from '../components/LocationTabs/SavedAddresses';
import ArrowRightIcon from '../assets/icons/RightArrow';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../shared/utils/routes';
import { useSelector } from 'react-redux';

const TABS = [
    { key: 'map', label: 'الخريطة' },
    { key: 'list', label: 'تأكيد الموقع' },
];

const LocationScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('map');
    const category = useSelector((state: any) => state.root.booking.category);

    const renderHeader = () => (
        <Header
            centerComponent={
                <Text style={styles.headerTitle}>{t('booking')}</Text>
            }
            leftComponent={
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.bookButton}>
                    <ArrowRightIcon />
                </TouchableOpacity>
            }
            containerStyle={styles.headerContainer}
        />
    );

    const onPressLocation = () => {
        if (category.Id == "41") {
            navigation.navigate(ROUTES.BookingScreen, { currentStep: 2 });
        } else {
            navigation.navigate(ROUTES.BookingScreen);
        }
    }

    return (
        <SafeAreaView style={styles.container}>

            {renderHeader()}
            <View style={styles.tabContainer}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={{ flex: 1 }}>
                {activeTab === 'map' ? <MapTab onPressLocation={() => onPressLocation()} /> : <SavedAddresses onPressLocation={() => onPressLocation()} />}
            </View>
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
    },
    activeTab: {
        backgroundColor: '#36a6ad',
    },
    tabLabel: {
        color: '#333',
        fontWeight: 'bold',
    },
    activeTabLabel: {
        color: '#fff',
    },
    content: { flex: 1 },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000'
    },
    headerContainer: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    bookButton: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
    }
});

export default LocationScreen; 