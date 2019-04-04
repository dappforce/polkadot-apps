// Copyright 2017-2019 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { WithTranslation } from 'react-i18next';
import { BareProps } from './types';

import React from 'react';
import Dropzone from 'react-dropzone';

import { classes } from './util';
import Labelled from './Labelled';
import translate from './translate';

type Props = BareProps & WithTranslation & {
  // Reference Example Usage: https://github.com/react-dropzone/react-dropzone/tree/master/examples/Accept
  // i.e. MIME types: 'application/json, text/plain', or '.json, .txt'
  accept?: string,
  clearContent?: boolean,
  isDisabled?: boolean,
  isError?: boolean,
  label?: React.ReactNode,
  withLabel?: boolean,
  placeholder?: React.ReactNode,
  onChange?: (contents: Uint8Array, file: File) => void
};

type State = {
  file?: {
    name: string,
    size: number
  }
};

type LoadEvent = {
  target: {
    result: ArrayBuffer
  }
};

class InputFile extends React.PureComponent<Props, State> {
  state: State = {};

  render () {
    const { accept, className, clearContent, isDisabled, isError = false, label, placeholder, t, withLabel } = this.props;
    const { file } = this.state;

    const dropzone =
      <Dropzone
        accept={accept}
        className={classes('ui--InputFile', isError ? 'error' : '', className)}
        disabled={isDisabled}
        multiple={false}
        onDrop={this.onDrop}
      >
        <div className='label'>
        {!file || clearContent
          ? placeholder || t('Drag and drop the file here')
          : placeholder || t('{{name}} ({{size}} bytes)', {
            replace: file
          })
        }
        </div>
      </Dropzone>;

    return withLabel
      ? <Labelled label={label}>{dropzone}</Labelled>
      : dropzone;
  }

  private onDrop = (files: Array<File>) => {
    const { onChange } = this.props;

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => {
        // ignore
      };

      reader.onerror = () => {
        // ignore
      };

      // @ts-ignore ummm... events are not properly specified here?
      reader.onload = ({ target: { result } }: LoadEvent) => {
        const data = new Uint8Array(result);

        onChange && onChange(data, file);

        this.setState({
          file: {
            name: file.name,
            size: data.length
          }
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }
}

export default translate(InputFile);
