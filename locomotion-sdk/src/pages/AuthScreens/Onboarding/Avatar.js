import React, { useContext } from 'react';
import i18n from '../../../I18n';
import OnboardingNavButtons from './OnboardingNavButtons';
import { OnboardingContext } from '../../../context/onboarding';
import {
  ImageContainer, Name, PageContainer, SafeView,
} from './styles';
import Header from './Header';
import ScreenText from './ScreenText/index';
import ThumbnailPicker from '../../../Components/ThumbnailPicker';
import { MAIN_ROUTES } from '../../routes';
import { UserContext } from '../../../context/user';

const Avatar = () => {
  const { nextScreen } = useContext(OnboardingContext);
  const { updateUserInfo, user } = useContext(UserContext);

  const onImageChoose = (image) => {
    updateUserInfo({ avatar: image });
  };

  return (
    <SafeView>
      <Header title={i18n.t('onboarding.pages.avatar.title')} page={MAIN_ROUTES.AVATAR} />
      <PageContainer>
        <ScreenText
          text={i18n.t('onboarding.pages.avatar.text')}
          subText={i18n.t('onboarding.pages.avatar.subText')}
        />
        <ImageContainer>
          <ThumbnailPicker
            onImageChoose={onImageChoose}
            avatarSource={user.avatar}
            size={125}
          />
          <Name>
            {`${user.firstName} ${user.lastName}`}
          </Name>
        </ImageContainer>
        <OnboardingNavButtons
          onNext={() => nextScreen(MAIN_ROUTES.AVATAR)}
          isInvalid={!user.avatar}
        />
      </PageContainer>
    </SafeView>
  );
};

export default Avatar;
