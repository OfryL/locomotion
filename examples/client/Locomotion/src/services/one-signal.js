/* eslint-disable class-methods-use-this */
import { Platform } from 'react-native';
import OneSignal from 'react-native-onesignal'; // Import package from node modules
import Config from 'react-native-config';
import network from './network';
import { updateUser } from '../context/user/api';
import { StorageService } from '.';
import Mixpanel from './Mixpanel';
import * as NavigationService from './navigation';
import { MAIN_ROUTES } from '../pages/routes';

const openNotificationsHandlers = {
  message: ({ messageId }) => {
    console.log('messageIdmessageId', messageId);

    setTimeout(() => {
      NavigationService.navigate(MAIN_ROUTES.MESSAGE_VIEW, { messageId });
    }, 3000);
  },
};


class NotificationsService {
  constructor() {
    this.network = network;
    this.notificationsHandlers = {};
  }

  updateServer = async (pushTokenId, userId, isSubscribed) => {
    const clientProfile = await StorageService.get('clientProfile');
    if (clientProfile) {
      if (clientProfile.pushUserId !== userId || clientProfile.pushTokenId !== pushTokenId) {
        this.registerOnServer({
          pushTokenId,
          pushUserId: userId,
          isSubscribed,
        });
      }
    }
  };

  checkLatestDeviceState = async () => {
    const state = await OneSignal.getDeviceState();
    Mixpanel.setEvent('Notification Service: Check App State', state || undefined);
    if (state) {
      const { pushToken, userId, isSubscribed } = state;
      if (pushToken && userId && isSubscribed) {
        await this.updateServer(pushToken, userId, isSubscribed);
      }
    }
  };

  init = async (notificationsHandlers) => {
    this.notificationsHandlers = notificationsHandlers;

    OneSignal.setAppId(Config.ONESIGNAL_APP_ID);
    OneSignal.setNotificationOpenedHandler(this.onOpened);
    OneSignal.disablePush(false);

    if (Platform.OS === 'ios') {
      OneSignal.promptForPushNotificationsWithUserResponse((response) => {
        if (response) {
          return Mixpanel.setEvent('iOS User approved push');
        }
        Mixpanel.setEvent('iOS User didn\'t approved push');
        return null;
      });
    }
    OneSignal.addSubscriptionObserver(this.subscriptionObserverHandler);
    OneSignal.addPermissionObserver(this.checkLatestDeviceState);

    await this.checkLatestDeviceState();
  };

  getDeviceState = async () => {
    const deviceState = await OneSignal.getDeviceState();
    return deviceState;
  };

  subscriptionObserverHandler = async (data) => {
    const { to } = data;
    const { pushToken, userId, isSubscribed } = to;
    if (pushToken && userId) {
      await this.updateServer(pushToken, userId, isSubscribed);
    }
  };

  onOpened = (openResult) => {
    console.log(openResult);
    const { additionalData } = openResult.notification;
    console.log(additionalData);
    /* if (additionalData && additionalData.type) {
      console.log('sdfsdfsdf');
      console.log(openNotificationsHandlers);
      const method = openNotificationsHandlers[additionalData.type];
      if (method) {
        method(additionalData);
      }
    } */
  };

  triggerOnNotification = (payload) => {
    console.log('new notification', payload);
  };

  registerOnServer = async ({ pushUserId, pushTokenId, isSubscribed }) => {
    const pushUserData = {
      pushUserId,
      pushTokenId,
      isPushEnabled: isSubscribed,
      deviceType: Platform.OS,
    };

    const response = await updateUser(pushUserData);
    console.log(response.data);
  };

  getOneSignalId = () => new Promise(resolve => OneSignal.getPermissionSubscriptionState(({ userId }) => resolve(userId)));

  setNotificationsHandlers = (notificationsHandlers) => {
    this.notificationsHandlers = {
      ...this.notificationsHandlers,
      ...notificationsHandlers,
    };
  };
}

export default new NotificationsService();
