import bytes from 'bytes';
import trimEnd from 'lodash/trimEnd';
import queryString from 'querystring';
import React, { memo, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { CATALOG_PREFIX } from '../config';
import DirectoryLink from './DirectoryLink';

export default memo(BrowseList);
function BrowseList({ virtual, ...props }) {
  const {
    currContext,
    currIdx,
    favorites,
    toggleFavorite,
    sequencer,
    handleSongClick,
    browsePath,
    playContext,
    analyses,
  } = props;

  const location = useLocation();

  // Chiptheory's autoplay for NES, because most directories have a single file
  useEffect(() => {
    const firstSongItem = virtual.items.find(item => item.type !== 'directory');

    if (firstSongItem) {
      const path = firstSongItem.path === '..' ?
        browsePath.substr(0, browsePath.lastIndexOf('/')) :
        firstSongItem.path.replace('%', '%25').replace('#', '%23').replace(/^\//, '');

      const params = new URLSearchParams(location.search);
      let subtune = params.get('subtune')
      if (subtune) {
        subtune = parseInt(subtune, 10) - 1
        params.delete('subtune')
        history.push({ pathname: location.pathname })
      } else {
        subtune = 0
      }

      const href = CATALOG_PREFIX + path;
      handleSongClick(href, playContext, firstSongItem.idx, subtune)({
        preventDefault: () => { },
      });
    }
    // Add the dependencies that would trigger the effect when changed
  }, [virtual.items.length]);

  // Scroll Into View
  // ----------------
  // Note this does not work for virtual list, since the playing item might not be in the DOM.
  // See also https://medium.com/@teh_builder/ref-objects-inside-useeffect-hooks-eb7c15198780
  const urlParams = queryString.parse(window.location.search.substring(1));
  delete urlParams.q;
  const search = queryString.stringify(urlParams);

  // Check if previous page url is the parent directory of current page url.
  const history = useHistory();
  const prevPath = trimEnd(history.location.state?.prevPathname, '/');
  const currPath = trimEnd(window.location.pathname, '/');
  const prevPageIsParentDir = prevPath === currPath.substring(0, currPath.lastIndexOf('/'));

  return (
    <div style={{ position: 'relative' }}>
      <div style={virtual.style}>
        {virtual.items.map(item => {
          // XXX: Escape immediately: the escaped URL is considered canonical.
          //      The URL must be decoded for display from here on out.
          const path = item.path === '..' ?
            browsePath.substr(0, browsePath.lastIndexOf('/')) : // parent path
            item.path.replace('%', '%25').replace('#', '%23').replace(/^\//, '');
          const name = item.path.split('/').pop();
          const isPlaying = currContext === playContext && currIdx === item.idx;
          const isBackLink = item.path === '..' && prevPageIsParentDir;
          let analysis = analyses && analyses[path] && Object.values(analyses[path])
          if (analysis && analysis[0]) {
            analysis = analysis[0]
          }

          if (item.type === 'directory') {
            return (
              <div key={name} className="BrowseList-row">
                <div className="BrowseList-colName">
                  <DirectoryLink dim={!analysis} to={'/browse/' + path} search={search} isBackLink={isBackLink} history={history}>{name}</DirectoryLink>
                </div>
                {analysis && <div>
                  {Object.keys(analysis).map(index => {
                    const realIndex = parseInt(index, 10) + 1
                    return <DirectoryLink key={realIndex} dim={!analysis} to={'/browse/' + path} search={`?subtune=${realIndex}`}>[{realIndex}]</DirectoryLink>
                  })}
                </div>}
                {/* className="BrowseList-colDir" */}
                {/* <div className="BrowseList-colCount" title={`Contains ${item.numChildren} direct child items`}>
                  {item.numChildren}
                </div>
                <div className="BrowseList-colSize" title={`Directory size is ${item.size} bytes (recursive)`}>
                  {item.size != null && bytes(item.size, { unitSeparator: ' ' })}
                </div> */}
              </div>
            );
          } else {
            const href = CATALOG_PREFIX + path;
            return (
              <div key={name} className={isPlaying ? 'Song-now-playing BrowseList-row' : 'BrowseList-row'}>
                <div className="BrowseList-colName">
                  {/* {favorites &&
                      <FavoriteButton isFavorite={favorites.includes(href)}
                                      href={href}
                                      toggleFavorite={toggleFavorite}/>} */}
                  <a onClick={(e) => handleSongClick(href, playContext, item.idx)(e)}
                    href={href}>
                    {name}
                  </a>
                </div>
                <div className="BrowseList-colSize">
                  {bytes(item.size, { unitSeparator: ' ' })}
                </div>
              </div>
            );
          }
        })}
      </div>
    </div >
  );
};
