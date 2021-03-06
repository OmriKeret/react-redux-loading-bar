/* eslint import/no-extraneous-dependencies: 0 */
import React from 'react'
import { shallow } from 'enzyme'
import expect, { spyOn } from 'expect'
import expectJSX from 'expect-jsx'
import lolex from 'lolex'

import {
  LoadingBar,
  UPDATE_TIME,
  MAX_PROGRESS,
  PROGRESS_INCREASE,
  ANIMATION_TIME,
} from '../src/loading_bar'

expect.extend(expectJSX)

describe('LoadingBar', () => {
  describe('#render', () => {
    it('renders without problems', () => {
      const wrapper = shallow(<LoadingBar />)

      expect(wrapper.node.type).toEqual('div')
    })

    it('renders by default hidden 3px height red element', () => {
      const wrapper = shallow(<LoadingBar />)

      const resultStyle = wrapper.children().node.props.style
      expect(resultStyle.opacity).toEqual('0')
      expect(resultStyle.backgroundColor).toEqual('red')
      expect(resultStyle.height).toEqual('3px')
    })

    it('renders an element with passed color and height', () => {
      const style = { backgroundColor: 'blue', height: '5px' }
      const wrapper = shallow(<LoadingBar style={style} />)

      const resultStyle = wrapper.children().node.props.style
      expect(resultStyle.backgroundColor).toEqual('blue')
      expect(resultStyle.height).toEqual('5px')
    })

    it('renders not hidden 3px height red element', () => {
      const wrapper = shallow(<LoadingBar loading={1} />)
      wrapper.setState({ percent: 10 })

      const resultStyle = wrapper.children().node.props.style
      expect(resultStyle.opacity).toEqual('1')
      expect(resultStyle.backgroundColor).toEqual('red')
      expect(resultStyle.height).toEqual('3px')
      expect(resultStyle.position).toEqual('absolute')
    })

    it('does not apply styling if CSS class is specified', () => {
      const wrapper = shallow(<LoadingBar className="custom" />)

      const resultStyle = wrapper.children().node.props.style
      expect(resultStyle.backgroundColor).toEqual(undefined)
      expect(resultStyle.height).toEqual(undefined)
      expect(resultStyle.position).toEqual(undefined)
    })
  })

  describe('#componentWillReceiveProps', () => {
    let spyLaunch

    beforeEach(() => {
      spyLaunch = spyOn(LoadingBar.prototype, 'launch')
    })
    afterEach(() => {
      spyLaunch.restore()
    })

    it('does not launch on component mount', () => {
      shallow(<LoadingBar />)
      expect(spyLaunch).toNotHaveBeenCalled()
      expect(spyLaunch.calls.length).toEqual(0)
    })

    it('launches on loading count increase', () => {
      const wrapper = shallow(<LoadingBar />)
      wrapper.setProps({ loading: 1 })
      expect(spyLaunch).toHaveBeenCalled()
      expect(spyLaunch.calls.length).toEqual(1)
    })

    it('does not launch if loading count is not increased', () => {
      const wrapper = shallow(<LoadingBar />)
      wrapper.setProps({ loading: 0 })
      expect(spyLaunch).toNotHaveBeenCalled()
      expect(spyLaunch.calls.length).toEqual(0)
    })

    it('launches on component mount if loading count is > 0', () => {
      shallow(<LoadingBar loading={1} />)
      expect(spyLaunch).toHaveBeenCalled()
      expect(spyLaunch.calls.length).toEqual(1)
    })
  })

  describe('#componentWillUnmount', () => {
    let clock
    let consoleSpy

    beforeEach(() => {
      consoleSpy = spyOn(console, 'error')
      clock = lolex.install()
    })
    afterEach(() => {
      clock.uninstall()
      consoleSpy.restore()
    })

    it('does not throw errors in the console', () => {
      const wrapper = shallow(<LoadingBar />)
      wrapper.setProps({ loading: 1 })
      expect(wrapper.state().progressInterval).toNotEqual(null)
      wrapper.unmount()
      clock.tick(UPDATE_TIME)
      expect(consoleSpy).toNotHaveBeenCalled()
    })

    it('does not throw errors in the console after loading', () => {
      const wrapper = shallow(<LoadingBar />)
      wrapper.setProps({ loading: 1 })
      clock.tick(UPDATE_TIME)
      wrapper.setProps({ loading: 0 })
      clock.tick(UPDATE_TIME * 2)
      expect(wrapper.state().animationTimeout).toNotEqual(null)
      wrapper.unmount()
      clock.tick(ANIMATION_TIME)
      expect(consoleSpy).toNotHaveBeenCalled()
    })
  })

  describe('#launch', () => {
    let clock
    let spySimulateProgress

    beforeEach(() => {
      spySimulateProgress = spyOn(
        LoadingBar.prototype,
        'simulateProgress',
      )
      clock = lolex.install()
    })
    afterEach(() => {
      spySimulateProgress.restore()
      clock.uninstall()
    })

    it('schedules simulateProgress on UPDATE_TIME', () => {
      const wrapper = shallow(<LoadingBar />)
      wrapper.setProps({ loading: 1 })
      clock.tick(UPDATE_TIME)
      expect(spySimulateProgress).toHaveBeenCalled()
      expect(spySimulateProgress.calls.length).toEqual(1)
    })

    it('does not schedule simulateProgress before UPDATE_TIME', () => {
      const wrapper = shallow(<LoadingBar />)
      wrapper.setProps({ loading: 1 })
      clock.tick(UPDATE_TIME - 1)
      expect(spySimulateProgress).toNotHaveBeenCalled()
      expect(spySimulateProgress.calls.length).toEqual(0)
    })

    it('schedules simulateProgress twice after UPDATE_TIME * 2', () => {
      const wrapper = shallow(<LoadingBar />)
      wrapper.setProps({ loading: 1 })
      clock.tick(UPDATE_TIME * 2)
      expect(spySimulateProgress).toHaveBeenCalled()
      expect(spySimulateProgress.calls.length).toEqual(2)
    })
  })

  describe('#simulateProgress', () => {
    let clock

    beforeEach(() => {
      clock = lolex.install()
    })
    afterEach(() => {
      clock.uninstall()
    })

    it('sets percent to 100 if loading becomes 0', () => {
      const wrapper = shallow(<LoadingBar />)
      wrapper.setProps({ loading: 1 })
      clock.tick(UPDATE_TIME)
      expect(wrapper.state().progressInterval).toExist()
      wrapper.setProps({ loading: 0 })
      clock.tick(UPDATE_TIME)
      expect(wrapper.state().progressInterval).toExist()
      expect(wrapper.state().percent).toBe(100)
    })

    it('clears interval if loading becomes 0 after one more tick', () => {
      const wrapper = shallow(<LoadingBar />)
      wrapper.setProps({ loading: 1 })
      clock.tick(UPDATE_TIME)
      expect(wrapper.state().progressInterval).toExist()
      wrapper.setProps({ loading: 0 })
      clock.tick(UPDATE_TIME * 2)
      expect(wrapper.state().progressInterval).toNotExist()
    })

    it('resets progress if loading becomes 0 and after animations', () => {
      const wrapper = shallow(<LoadingBar />)
      wrapper.setProps({ loading: 1 })
      clock.tick(UPDATE_TIME)
      expect(wrapper.state().percent).toBeGreaterThan(0).toBeLessThan(100)
      wrapper.setProps({ loading: 0 })
      clock.tick(UPDATE_TIME)
      expect(wrapper.state().percent).toBe(100)
      clock.tick(UPDATE_TIME + ANIMATION_TIME)
      expect(wrapper.state().percent).toBe(0)
      expect(wrapper.state().animationTimeout).toNotExist()
    })

    describe('if percent is less than MAX_PROGRESS', () => {
      it('increases percent', () => {
        const wrapper = shallow(<LoadingBar />)
        expect(wrapper.state().percent).toBe(0)
        wrapper.setProps({ loading: 1 })
        clock.tick(UPDATE_TIME)
        expect(wrapper.state().percent).toBe(PROGRESS_INCREASE)
      })
    })

    describe('if percent is MAX_PROGRESS', () => {
      it('does not increase percent further', () => {
        const wrapper = shallow(<LoadingBar />)
        expect(wrapper.state().percent).toBe(0)
        wrapper.setProps({ loading: 1 })
        clock.tick(UPDATE_TIME * (MAX_PROGRESS / PROGRESS_INCREASE))
        expect(wrapper.state().percent).toBe(MAX_PROGRESS)
        clock.tick(UPDATE_TIME)
        expect(wrapper.state().percent).toBe(MAX_PROGRESS)
      })
    })

    describe('if it should be shown again during ending animation', () => {
      let spySimulateProgress

      beforeEach(() => {
        spySimulateProgress = spyOn(
          LoadingBar.prototype,
          'simulateProgress',
        ).andCallThrough()
      })
      afterEach(() => {
        spySimulateProgress.restore()
      })

      it('does not hang and resets the position', () => {
        const wrapper = shallow(<LoadingBar />)

        // Show Loading Bar
        wrapper.setProps({ loading: 1 })
        clock.tick(UPDATE_TIME)
        expect(wrapper.state().progressInterval).toExist()

        // Hide Loading Bar, let the percent become 100 and
        // schedule the reset after animation
        wrapper.setProps({ loading: 0 })
        clock.tick(UPDATE_TIME * 2)
        expect(wrapper.state().animationTimeout).toExist()

        // Wait one tick while animation is going
        clock.tick(UPDATE_TIME)

        // Show Loading Bar again
        wrapper.setProps({ loading: 1 })
        expect(wrapper.state().progressInterval).toExist()

        // It should be shown
        expect(wrapper.state().percent).toNotEqual(100)

        // Hide Loading Bar and emulate a long period of time
        wrapper.setProps({ loading: 0 })
        clock.tick(UPDATE_TIME * 1000)

        expect(spySimulateProgress.calls.length).toEqual(5)
      })
    })
  })

  describe('updateTime prop', () => {
    let clock
    let spySimulateProgress

    beforeEach(() => {
      spySimulateProgress = spyOn(
        LoadingBar.prototype,
        'simulateProgress',
      )
      clock = lolex.install()
    })
    afterEach(() => {
      spySimulateProgress.restore()
      clock.uninstall()
    })

    it('can be changed', () => {
      const updateTime = 100
      const wrapper = shallow(<LoadingBar updateTime={updateTime} />)
      wrapper.setProps({ loading: 1 })
      clock.tick(updateTime)
      expect(spySimulateProgress).toHaveBeenCalled()
      expect(spySimulateProgress.calls.length).toEqual(1)
    })
  })

  describe('maxProgress prop', () => {
    let clock

    beforeEach(() => {
      clock = lolex.install()
    })
    afterEach(() => {
      clock.uninstall()
    })

    it('can be changed', () => {
      const maxProgress = 95
      const wrapper = shallow(<LoadingBar maxProgress={maxProgress} />)
      wrapper.setProps({ loading: 1 })
      clock.tick(UPDATE_TIME * (maxProgress / PROGRESS_INCREASE))
      expect(wrapper.state().percent).toEqual(maxProgress)
    })
  })

  describe('progressIncrease prop', () => {
    let clock

    beforeEach(() => {
      clock = lolex.install()
    })
    afterEach(() => {
      clock.uninstall()
    })

    it('can be changed', () => {
      const progressIncrease = 5
      const wrapper = shallow(
        <LoadingBar progressIncrease={progressIncrease} />,
      )
      wrapper.setProps({ loading: 1 })
      clock.tick(UPDATE_TIME)
      expect(wrapper.state().percent).toEqual(progressIncrease)
    })
  })
})
