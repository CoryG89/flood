import defaultFloodSettings from '@shared/constants/defaultFloodSettings';

import type {ClientSetting, ClientSettings} from '@shared/types/ClientSettings';
import type {FloodSetting, FloodSettings} from '@shared/types/FloodSettings';

import AlertStore from './AlertStore';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import ClientActions from '../actions/ClientActions';
import SettingsActions from '../actions/SettingsActions';
import UIStore from './UIStore';

export interface SettingsSaveOptions {
  alert?: boolean;
  dismissModal?: boolean;
}

class SettingsStoreClass extends BaseStore {
  fetchStatus = {
    clientSettingsFetched: false,
    floodSettingsFetched: false,
  };

  clientSettings: ClientSettings | null = null;

  // Default settings are overridden by settings stored in database.
  floodSettings: FloodSettings = {...defaultFloodSettings};

  getClientSetting<T extends ClientSetting>(property: T): ClientSettings[T] | null {
    if (this.clientSettings == null) {
      return null;
    }
    return this.clientSettings[property];
  }

  getClientSettings(): ClientSettings | null {
    if (this.clientSettings == null) {
      return null;
    }
    return this.clientSettings;
  }

  getFloodSetting<T extends FloodSetting>(property: T): FloodSettings[T] {
    return this.floodSettings[property];
  }

  getFloodSettings(): FloodSettings {
    return this.floodSettings;
  }

  handleClientSettingsFetchSuccess(settings: ClientSettings) {
    this.fetchStatus.clientSettingsFetched = true;
    this.clientSettings = settings;

    this.processSettingsState();
  }

  handleClientSettingsFetchError() {
    this.emit('CLIENT_SETTINGS_FETCH_REQUEST_ERROR');
  }

  handleClientSettingsSaveRequestError() {
    this.emit('CLIENT_SETTINGS_SAVE_REQUEST_ERROR');
  }

  handleClientSettingsSaveRequestSuccess(options: {alert?: boolean; dismissModal?: boolean}) {
    this.emit('CLIENT_SETTINGS_SAVE_REQUEST_SUCCESS');

    if (options.alert) {
      AlertStore.add({
        id: 'alert.settings.saved',
      });
    }

    if (options.dismissModal) {
      UIStore.dismissModal();
    }
  }

  handleSettingsFetchError() {
    this.emit('SETTINGS_FETCH_REQUEST_ERROR');
  }

  handleSettingsFetchSuccess(settings: Partial<FloodSettings>): void {
    this.fetchStatus.floodSettingsFetched = true;

    Object.assign(this.floodSettings, settings);

    this.emit('SETTINGS_FETCH_REQUEST_SUCCESS');
    this.processSettingsState();
  }

  handleSettingsSaveRequestError() {
    this.emit('SETTINGS_SAVE_REQUEST_ERROR');
  }

  handleSettingsSaveRequestSuccess(options: {alert?: boolean; dismissModal?: boolean}) {
    this.emit('SETTINGS_SAVE_REQUEST_SUCCESS');

    if (options.alert) {
      AlertStore.add({
        id: 'alert.settings.saved',
      });
    }

    if (options.dismissModal) {
      UIStore.dismissModal();
    }
  }

  processSettingsState() {
    if (this.fetchStatus.clientSettingsFetched && this.fetchStatus.floodSettingsFetched) {
      this.emit('SETTINGS_CHANGE');
    }
  }

  saveFloodSettings(settings: Partial<FloodSettings>, options: SettingsSaveOptions = {}) {
    if (Object.keys(settings).length > 0) {
      SettingsActions.saveSettings(settings, options);
    } else {
      AppDispatcher.dispatchServerAction({
        type: 'SETTINGS_SAVE_REQUEST_SUCCESS',
        options,
      });
    }
    Object.assign(this.floodSettings, settings);
    this.emit('SETTINGS_CHANGE');
  }

  saveClientSettings(settings: Partial<ClientSettings>, options: SettingsSaveOptions = {}) {
    if (Object.keys(settings).length > 0) {
      ClientActions.saveSettings(settings, options);
    } else {
      AppDispatcher.dispatchServerAction({
        type: 'CLIENT_SETTINGS_SAVE_SUCCESS',
        options,
      });
    }
    Object.assign(this.clientSettings, settings);
    this.emit('SETTINGS_CHANGE');
  }

  setFloodSetting = <T extends FloodSetting>(property: T, data: FloodSettings[T]) => {
    this.saveFloodSettings({[property]: data});
  };

  setClientSetting = <T extends ClientSetting>(property: T, data: ClientSettings[T]) => {
    this.saveClientSettings({[property]: data});
  };
}

const SettingsStore = new SettingsStoreClass();

SettingsStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action} = payload;

  switch (action.type) {
    case 'CLIENT_SETTINGS_FETCH_REQUEST_ERROR':
      SettingsStore.handleClientSettingsFetchError();
      break;
    case 'CLIENT_SETTINGS_FETCH_REQUEST_SUCCESS':
      SettingsStore.handleClientSettingsFetchSuccess(action.data);
      break;
    case 'SETTINGS_FETCH_REQUEST_ERROR':
      SettingsStore.handleSettingsFetchError();
      break;
    case 'SETTINGS_FETCH_REQUEST_SUCCESS':
      SettingsStore.handleSettingsFetchSuccess(action.data);
      break;
    case 'SETTINGS_SAVE_REQUEST_ERROR':
      SettingsStore.handleSettingsSaveRequestError();
      break;
    case 'SETTINGS_SAVE_REQUEST_SUCCESS':
      SettingsStore.handleSettingsSaveRequestSuccess(action.options);
      break;
    case 'CLIENT_SETTINGS_SAVE_ERROR':
      SettingsStore.handleClientSettingsSaveRequestError();
      break;
    case 'CLIENT_SETTINGS_SAVE_SUCCESS':
      SettingsStore.handleClientSettingsSaveRequestSuccess(action.options);
      break;
    default:
      break;
  }
});

export default SettingsStore;
