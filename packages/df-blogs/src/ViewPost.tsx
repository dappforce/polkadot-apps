import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import ReactMarkdown from 'react-markdown';
import { Segment, Dropdown } from 'semantic-ui-react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { Option } from '@polkadot/types';

import { getJsonFromIpfs } from './OffchainUtils';
import { PostId, Post, CommentId, PostData } from './types';
import { queryBlogsToProp, UrlHasIdProps } from './utils';
import { withMyAccount, MyAccountProps } from '@polkadot/df-utils/MyAccount';
import { CommentsByPost } from './ViewComment';
import { CreatedBy } from './CreatedBy';
import { MutedSpan } from '@polkadot/df-utils/MutedText';
import { Voter } from './Voter';
import { PostHistoryModal } from './ListsEditHistory';
import { PostVoters, ActiveVoters } from './ListVoters';
import AddressMiniDf from '@polkadot/ui-app/AddressMiniDf';

const LIMIT_SUMMARY = 150;

type ViewPostProps = MyAccountProps & {
  preview?: boolean,
  nameOnly?: boolean,
  withCreatedBy?: boolean,
  id: PostId,
  postById?: Option<Post>,
  commentIds?: CommentId[]
};

function ViewPostInternal (props: ViewPostProps) {
  const { postById } = props;

  if (postById === undefined) return <em>Loading...</em>;
  else if (postById.isNone) return <em>Post not found</em>;

  const {
    myAddress,
    preview = false,
    nameOnly = false,
    id,
    withCreatedBy = true
  } = props;

  const post = postById.unwrap();
  const {
    created: { account },
    comments_count,
    upvotes_count,
    downvotes_count,
    ipfs_hash
  } = post;
  const [ content , setContent ] = useState({} as PostData);
  const [ summary, setSummary ] = useState('');
  const [ commentsSection, setCommentsSection ] = useState(false);
  const [ postVotersOpen, serPostVotersOpen ] = useState(false);
  const [ activeVoters, setActiveVoters ] = useState(0);
  const openVoters = (type: ActiveVoters) => {
    serPostVotersOpen(true);
    setActiveVoters(type);
  };
  const { title, body, image } = content;
  useEffect(() => {
    if (!ipfs_hash) return;
    getJsonFromIpfs<PostData>(ipfs_hash).then(json => {
      setContent(json);
      const summary = json.body.length > LIMIT_SUMMARY ? json.body.substr(0,LIMIT_SUMMARY) + '...' : json.body;
      setSummary(summary);
      console.log(content);
    }).catch(err => console.log(err));
  }, [ false ]);

  const isMyStruct = myAddress === account.toString();

  const renderDropDownMenu = () => {

    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    return (<Dropdown icon='ellipsis horizontal'>
      <Dropdown.Menu>
        {isMyStruct && <Link className='item' to={`/blogs/posts/${id.toString()}/edit`}>Edit</Link>}
        <Dropdown.Item text='View edit history' onClick={() => setOpen(true)} />
        {open && <PostHistoryModal id={id} open={open} close={close}/>}
      </Dropdown.Menu>
    </Dropdown>);
  };

  const renderNameOnly = () => (<>
    <Link
      to={`/blogs/posts/${id.toString()}`}
      style={{ marginRight: '.5rem' }}
    >{title}
    </Link>
  </>
  );

  const renderPreview = () => {
    return <>
      <Segment>
        <h2>
          {renderNameOnly()}
          {renderDropDownMenu()}
        </h2>
        {withCreatedBy && <AddressMiniDf
              value={account}
              isShort={true}
              isPadded={false}
        />}
        <div style={{ margin: '1rem 0' }}>
          <ReactMarkdown className='DfMemo--full' source={summary} linkTarget='_blank' />
        </div>
        {/* <div style={{ marginTop: '1rem' }}><ShareButtonPost postId={post.id}/></div> */}
        <div className='DfCountsPreview'>
          <MutedSpan><HashLink to={`#commentsForPost${id}`} onClick={() => setCommentsSection(!commentsSection)}>
            Comments: <b>{comments_count.toString()}</b></HashLink></MutedSpan>
          <MutedSpan><Link to='#' onClick={() => openVoters(ActiveVoters.Upvote)}>Upvotes: <b>{upvotes_count.toString()}</b></Link></MutedSpan>
          <MutedSpan><Link to='#' onClick={() => openVoters(ActiveVoters.Downvote)}>Downvotes: <b>{downvotes_count.toString()}</b></Link></MutedSpan>
        </div>
        {commentsSection && <CommentsByPost postId={post.id} post={post} />}
        {postVotersOpen && <PostVoters id={id} active={activeVoters} open={postVotersOpen} close={() => serPostVotersOpen(false)}/>}
      </Segment>
    </>;
  };

  const renderDetails = () => {
    return <>
      <h1 style={{ display: 'flex' }}>
        <span style={{ marginRight: '.5rem' }}>{title}</span>
        {renderDropDownMenu()}
      </h1>
      {withCreatedBy && <CreatedBy created={post.created} />}
      <div style={{ margin: '1rem 0' }}>
        {image && <img src={image} className='DfPostImage' /* add onError handler */ />}
        <ReactMarkdown className='DfMemo--full' source={body} linkTarget='_blank' />
        {/* TODO render tags */}
      </div>
      <Voter struct={post} />
      {/* <ShareButtonPost postId={post.id}/> */}
      <CommentsByPost postId={post.id} post={post} />
    </>;
  };
  return nameOnly
    ? renderNameOnly()
    : preview
      ? renderPreview()
      : renderDetails();
}

export const ViewPost = withMulti(
  ViewPostInternal,
  withMyAccount,// TODO replese with useMyAccount
  withCalls<ViewPostProps>(
    queryBlogsToProp('postById', 'id')
  )
);

export function ViewPostById (props: UrlHasIdProps) {
  const { match: { params: { id } } } = props;
  try {
    return <ViewPost id={new PostId(id)}/>;
  } catch (err) {
    return <em>Invalid post ID: {id}</em>;
  }
}
