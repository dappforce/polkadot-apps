import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { History } from 'history';

import { Option, Text, AccountId } from '@polkadot/types';
import Section from '@polkadot/df-utils/Section';
import TxButton from '@polkadot/df-utils/TxButton';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti } from '@polkadot/ui-api/index';

import { addJsonToIpfs, getJsonFromIpfs, removeFromIpfs } from './OffchainUtils';
import * as DfForms from '@polkadot/df-utils/forms';
import { ProfileData, Profile, ProfileUpdate } from './types';
import { queryBlogsToProp } from '@polkadot/df-utils/index';
import { withIdFromMyAddress, getNewIdFromEvent } from './utils';
import { useMyAccount } from '@polkadot/df-utils/MyAccountContext';
import { SocialAccount } from '@dappforce/types/blogs';

// TODO get next settings from Substrate:
const USERNAME_REGEX = /^[A-Za-z0-9_-]+$/;

const URL_MAX_LEN = 2000;

const USERNAME_MIN_LEN = 5;
const USERNAME_MAX_LEN = 50;

const FULLNAME_MIN_LEN = 2;
const FULLNAME_MAX_LEN = 100;

const ABOUT_MAX_LEN = 1000;

function urlValidation (name: string) {
  return Yup.string()
    .url(`${name} URL is not valid.`)
    .max(URL_MAX_LEN, `${name} URL is too long. Maximum length is ${URL_MAX_LEN} chars.`);
}

const buildSchema = (p: ValidationProps) => Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .matches(USERNAME_REGEX, 'Username can have only letters (a-z, A-Z), numbers (0-9), underscores (_) and dashes (-).')
    .min(USERNAME_MIN_LEN, `Username is too short. Minimum length is ${USERNAME_MIN_LEN} chars.`)
    .max(USERNAME_MAX_LEN, `Username is too long. Maximum length is ${USERNAME_MAX_LEN} chars.`),

  fullname: Yup.string()
    .min(FULLNAME_MIN_LEN, `Full name is too short. Minimum length is ${FULLNAME_MIN_LEN} chars.`)
    .max(FULLNAME_MAX_LEN, `Full name is too long. Maximum length is ${FULLNAME_MAX_LEN} chars.`),

  avatar: Yup.string()
    .url('Avatar must be a valid URL.')
    .max(URL_MAX_LEN, `Avatar URL is too long. Maximum length is ${URL_MAX_LEN} chars.`),

  about: Yup.string()
    .max(ABOUT_MAX_LEN, `Text is too long. Maximum length is ${ABOUT_MAX_LEN} chars.`),

  facebook: urlValidation('Facebook'),

  twitter: urlValidation('Twitter'),

  linkedIn: urlValidation('LinkedIn'),

  github: urlValidation('GitHub'),

  instagram: urlValidation('Instagram')
});

type ValidationProps = {
  // TODO get username validation params
};

export type OuterProps = ValidationProps & {
  history?: History,
  id?: AccountId,
  struct?: Profile,
  json?: ProfileData
};

type FormValues = ProfileData & {
  username: string;
};

type FormProps = OuterProps & FormikProps<FormValues>;

const LabelledField = DfForms.LabelledField<FormValues>();

const LabelledText = DfForms.LabelledText<FormValues>();

const InnerForm = (props: FormProps) => {
  const {
    id,
    history,
    struct,
    values,
    dirty,
    isValid,
    isSubmitting,
    setSubmitting,
    resetForm
  } = props;

  const {
    username,
    fullname,
    avatar,
    about,
    facebook,
    twitter,
    linkedIn,
    github,
    instagram
  } = values;

  const goToView = (id: AccountId) => {
    if (history && id) {
      history.push(`/blogs/accounts/${id.toString()}`);
    }
  };

  const [ ipfsCid, setIpfsCid ] = useState('');

  const onSubmit = (sendTx: () => void) => {
    if (isValid) {
      const json = { fullname, avatar, about, facebook, twitter, linkedIn, github, instagram };
      addJsonToIpfs(json).then(cid => {
        setIpfsCid(cid);
        sendTx();
      }).catch(err => new Error(err));
    }
  };

  const onTxCancelled = () => {
    removeFromIpfs(ipfsCid).catch(err => new Error(err));
    setSubmitting(false);
  };

  const onTxFailed = (_txResult: SubmittableResult) => {
    removeFromIpfs(ipfsCid).catch(err => new Error(err));
    setSubmitting(false);
  };

  const onTxSuccess = (_txResult: SubmittableResult) => {
    setSubmitting(false);

    if (!history) return;

    const _id = id ? id : getNewIdFromEvent<AccountId>(_txResult);
    _id && goToView(_id);
  };

  const buildTxParams = () => {
    if (!isValid) return [];

    if (!struct) {
      return [ username, ipfsCid ];
    } else {
      // TODO update only dirty values.
      const update = new ProfileUpdate({
        username: new Option(Text, username),
        ipfs_hash: new Option(Text, ipfsCid)
      });
      return [ update ];
    }
  };

  const title = struct ? `Edit profile` : `New profile`;
  const shouldBeValidUrlText = `Should be a valid URL.`;

  return (
    <Section className='EditEntityBox' title={title}>
    <Form className='ui form DfForm EditEntityForm'>

      <LabelledText
        name='username'
        label='Username'
        placeholder={`You can use a-z, 0-9, dashes and underscores.`}
        style={{ maxWidth: '30rem' }}
        {...props}
      />

      <LabelledText
        name='fullname'
        label='Fullname'
        placeholder='Enter your fullname'
        {...props}
      />

      <LabelledText
        name='avatar'
        label='Avatar URL'
        placeholder={`Should be a valid image URL.`}
        {...props}
      />

      <LabelledText
        name='facebook'
        label='Facebook profile'
        placeholder={shouldBeValidUrlText}
        {...props}
      />

      <LabelledText
        name='twitter'
        label='Twitter profile'
        placeholder={shouldBeValidUrlText}
        {...props}
      />

      <LabelledText
        name='linkedIn'
        label='LinkedIn profile'
        placeholder={shouldBeValidUrlText}
        {...props}
      />

      <LabelledText
        name='github'
        label='GitHub profile'
        placeholder={shouldBeValidUrlText}
        {...props}
      />

      <LabelledText
        name='instagram'
        label='Instagram profile'
        placeholder={shouldBeValidUrlText}
        {...props}
      />

      <LabelledField name='about' label='About' {...props}>
        <Field component='textarea' id='about' name='about' disabled={isSubmitting} rows={3} placeholder='Tell others something about yourself. You can use Markdown.' />
      </LabelledField>

      <LabelledField {...props}>
        <TxButton
          type='submit'
          size='large'
          label={struct
            ? 'Update my profile'
            : 'Create my profile'
          }
          isDisabled={!dirty || isSubmitting}
          params={buildTxParams()}
          tx={struct
            ? 'blogs.updateProfile'
            : 'blogs.createProfile'
          }
          onClick={onSubmit}
          txCancelledCb={onTxCancelled}
          txFailedCb={onTxFailed}
          txSuccessCb={onTxSuccess}
        />
        <Button
          type='button'
          size='large'
          disabled={!dirty || isSubmitting}
          onClick={() => resetForm()}
          content='Reset form'
        />
      </LabelledField>
    </Form>
    </Section>
  );
};

const EditForm = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: (props): FormValues => {
    const { struct, json } = props;
    if (struct && json) {
      const username = struct.username.toString();
      return {
        username,
        ...json
      };
    } else {
      return {
        username: '',
        fullname: '',
        avatar: '',
        about: '',
        facebook: '',
        twitter: '',
        linkedIn: '',
        github: '',
        instagram: ''
      };
    }
  },

  validationSchema: buildSchema,

  handleSubmit: values => {
    // do submitting things
  }
})(InnerForm);

type LoadStructProps = OuterProps & {
  socialAccountOpt: Option<SocialAccount>
};

type StructJson = ProfileData | undefined;

type Struct = Profile | undefined;

function LoadStruct (props: LoadStructProps) {

  const { state: { address: myAddress } } = useMyAccount();
  const { socialAccountOpt } = props;
  const [ json, setJson ] = useState(undefined as StructJson);
  const [ struct, setStruct ] = useState(undefined as Struct);
  const jsonIsNone = json === undefined;

  const loadingProfile = <em>Loading profile...</em>;
  // const noProfile = <em>No profile for this account</em>;

  useEffect(() => {
    if (!myAddress || !socialAccountOpt || socialAccountOpt.isNone) return;

    const socialAccount = socialAccountOpt.unwrap();
    const profileOpt = socialAccount.profile;
    if (profileOpt.isNone) return;

    setStruct(profileOpt.unwrap() as Profile);

    if (struct === undefined) return;

    getJsonFromIpfs<ProfileData>(struct.ipfs_hash).then(json => {
      setJson(json);
    }).catch(err => console.log(err));
  }); // TODO add guard for loading from ipfs

  if (!myAddress || !socialAccountOpt || jsonIsNone) {
    return loadingProfile;
  }

  if (socialAccountOpt.isNone) {
    return <em>Profile not found...</em>;
  }

  return <EditForm {...props} struct={struct} json={json} />;
}

export const NewProfile = withMulti(
  EditForm
);

export const EditProfile = withMulti(
  LoadStruct,
  withIdFromMyAddress,
  withCalls<OuterProps>(
    queryBlogsToProp('socialAccountById',
      { paramName: 'id', propName: 'socialAccountOpt' })
  )
);
