import React from 'react'
import { connect } from 'react-redux'
import { head, path, compose, assoc } from 'ramda'
import {
  SET_ART_TITLE,
  SET_ARTIST,
  SET_POSITION,
  SET_TAG_PHOTO,
  SET_TAG,
  SET_GEO
} from '../constants'
import { TextField, Button } from 't63'
import FileInput from '../components/file-input'
import FormHeader from '../components/form/form-header'
import TaggedMap from '../components/map'

//onSubmit={props.submitProfile(props.history)(props.match.params.id)} line - 21
class EditTagForm extends React.Component {
  componentDidMount() {
    const tagId = this.props.match.params.id
    this.props.getMyTag(tagId)
  }

  render() {
    return (
      <div className="flex flex-column justify-between vh-100 w-100 avenir bg-white">
        <FormHeader />
        <main className="overflow-scroll flex flex-column tc w-100 vh-100 mt2">
          <h2 className="f4 f2-ns">New Tag</h2>
          <div id="form" className="center">
            <form
              className="ph2"
              onSubmit={this.props.submitTag(this.props.history)}
            >
              <div id="map" className="center">
                <TaggedMap
                  center={this.props.geo}
                  zoom={16}
                  containerElement={
                    <div style={{ height: '420px', width: '450px' }} />
                  }
                  mapElement={
                    <div style={{ height: '400px', width: '450px' }} />
                  }
                  markers={[
                    {
                      position: this.props.geo,
                      key: `user_location`,
                      defaultAnimation: 2,
                      icon: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAABVElEQVR42jWQPUtCYRiGbz9OapCGfeDxUEYZKTS0nKE0IQUpaLEv+4DUWl1CygaJ/oBEQ2lBi1OTQjUE1iKBJ4KiKRKi1aHfcJ7e55Tv+l7cz3XfAL8R2L3L2Ajs2R6Dua4PX8r02htGUfJAFb9WdCBfxhqNn/i1ndsQbd1PUqzSR4G8hdxz0KwKooIyQ17CZvzU36x9XeiNdo3KrUPKPkdovjpIwYJJd6nQ0A8ZfG73LkSNdpVefup0/V2ko/cVSj6M0/Slg+QESBpACuzE58qtvAGdfeZo/22B1upjNHPloOE0yKagBBZnp6w2ayQdCCjzNEWLNzKp5xIp6yJRFiC3mxDi7MTnVkUSQ+GKgwLHIHcEZHFiG9IQVNGuGSxAZyc+x0kMeRLQ7aOiTLcowzvxBE7RjsXZSUn+JRmQCzFjnv9n5gm4nSTExdAlS49oCng70C9TDYyoJxj9ZwAAAABJRU5ErkJggg==`
                    }
                  ]}
                />
              </div>
              <TextField
                value={this.props.artTitle}
                onChange={this.props.handleArtTitle}
                name="Art Title*"
                helptxt="If unknown, put something to describe it"
              />
              <TextField
                value={this.props.artist}
                onChange={this.props.handleArtist}
                name="Artist"
                helptxt="If left blank, will default to 'Unknown'"
              />
              <div className="measure mt2">
                <label className="f6 b db mb2">Photo (optional)</label>
                <div className="flex justify-center pv4">
                  <img
                    className="h4 w4 ba pa2 br2 mr2"
                    alt="tag"
                    src={
                      this.props.photo
                        ? this.props.photo
                        : "https://placehold.it/64x64?text='photo'"
                    }
                  />
                  <div id="file-input">
                    <FileInput
                      className="pv3 ml2"
                      onChange={this.props.handlePhoto}
                    >
                      <Button
                        type="button"
                        className="bg-green ba br2 b--light-green black"
                      >
                        Upload
                      </Button>
                    </FileInput>
                  </div>
                </div>
              </div>
              <div className="">
                <Button className="w-100 bg-green ba br2 b--light-green">
                  Save Contact
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    )
  }
}

const editTag = history => (dispatch, getState) => {
  var outTag = getState().tag
  outTag = assoc('position', getState().geo, outTag)
  fetch(`http://localhost:5000/tags/${outTag._id}`, {
    headers: { 'Content-Type': 'application/json' },
    method: 'PUT',
    body: JSON.stringify(outTag)
  })
    .then(res => res.json())
    .then(() => history.push('/profile'))
}

const asyncFetchMyTag = tagId => (dispatch, getState) => {
  fetch(`http://localhost:5000/tags/${tagId}`)
    .then(res => res.json())
    .then(res => {
      dispatch({ type: SET_TAG, payload: res })
      dispatch({ type: SET_GEO, payload: res.position })
    })
    .catch(error => {
      console.error(error)
    })
}

const mapStateToProps = state => {
  return {
    position: state.tag.position,
    artTitle: state.tag.artTitle,
    artist: state.tag.artist,
    photo: state.tag.photo,
    geo: state.geo
  }
}

const mapDispatchToProps = dispatch => {
  return {
    dispatch,
    getMyTag: tagId => {
      dispatch(asyncFetchMyTag(tagId))
    },
    submitTag: history => e => {
      e.preventDefault()
      dispatch(editTag(history))
    },
    handlePosition: e =>
      dispatch({ type: SET_POSITION, payload: e.target.value }),
    handleArtTitle: e =>
      dispatch({ type: SET_ART_TITLE, payload: e.target.value }),
    handleArtist: e => dispatch({ type: SET_ARTIST, payload: e.target.value }),
    handlePhoto: (e, results) => {
      const blob = compose(path(['target', 'result']), head, head)(results)
      dispatch({ type: SET_TAG_PHOTO, payload: blob })
    }
  }
}

const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(EditTagForm)
