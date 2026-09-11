import abc
import os

class SmsProvider(abc.ABC):
    @abc.abstractmethod
    async def send_otp(self, phone: str, otp: str) -> bool:
        pass

class DevFixedOtpProvider(SmsProvider):
    async def send_otp(self, phone: str, otp: str) -> bool:
        print(f"[DEV SMS] Sending OTP {otp} to {phone}")
        return True

class MSG91Provider(SmsProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def send_otp(self, phone: str, otp: str) -> bool:
        # Placeholder for actual MSG91 API call
        print(f"[MSG91] Sending OTP {otp} to {phone}")
        return True

class Fast2SMSProvider(SmsProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def send_otp(self, phone: str, otp: str) -> bool:
        # Placeholder for actual Fast2SMS API call
        print(f"[Fast2SMS] Sending OTP {otp} to {phone}")
        return True

def get_sms_provider() -> SmsProvider:
    provider = os.getenv("SMS_PROVIDER", "dev")
    api_key = os.getenv("SMS_API_KEY", "")

    if provider == "msg91":
        return MSG91Provider(api_key)
    elif provider == "fast2sms":
        return Fast2SMSProvider(api_key)
    else:
        return DevFixedOtpProvider()

sms_provider = get_sms_provider()
