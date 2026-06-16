import { securityDevicesRepository } from '../auth/devices/security-devices.repository';

export const securityService = {
  async deleteAllOtherDevices(
    userId: string,
    currentDeviceId: string,
  ): Promise<void> {
    await securityDevicesRepository.deleteAllOtherDevices(
      userId,
      currentDeviceId,
    );
  },

  async deleteDevice(
    userId: string,
    deviceId: string,
  ): Promise<'notFound' | 'forbidden' | 'success'> {
    const device =
      await securityDevicesRepository.findByDeviceId(deviceId);

    if (!device) {
      return 'notFound';
    }

    if (device.userId !== userId) {
      return 'forbidden';
    }

    await securityDevicesRepository.deleteByDeviceId(deviceId);

    return 'success';
  },
};