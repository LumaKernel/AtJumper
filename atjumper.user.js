// ==UserScript==
// @name         AtJumper
// @namespace    https://twitter.com/lumc_
// @version      2.1
// @description  Jump AtCoder between old and new
// @author       Luma
// @include      https://*contest.atcoder.jp/*
// @include      https://atcoder.jp/contests/*
// ==/UserScript==

/*

旧版 :
*.constest.atcoder.jp/~ のみ

*/

// 404でないページを前提しています

/* global $, LANG */

;(function () {
  'use strict'
  const host = location.host
  const pathname = location.pathname
  const isNew = !host.match(/.*\.contest\.atcoder\.jp$/)
  const isTop = host === 'atcoder.jp'
  const existNav = isNew ? false : $('.nav').attr('id') !== 'nav-right-logined'
  const TASKS = 'tasks'
  const ASSIGHNMENTS = 'assignments'

  const subs = [
    TASKS,
    ASSIGHNMENTS,
    'submit',
    'clarifications',
    'submissions',
    'standings',
    'custom_test',
    'ranking',
    'contest'
  ]

  const JumpToOld = { ja: '旧版へ', en: 'Jump to old version' }
  const JumpToNew = { ja: '新版へ', en: 'Jump to new version' }

  const isNotNIHONGO = isNew
    ? LANG !== 'ja'
    : isTop
      ? !$('a.dropdown-toggle')
        .eq(0)
        .html()
        .match(/日本語/)
      : getLang() !== 'ja'

  let $nav = existNav && $('.nav').eq(0)

  if (!existNav) makeNav()

  if (isNew) {
    if (isJumpableToOld()) {
      const label = isNotNIHONGO ? JumpToOld.en : JumpToOld.ja
      const $button = $(`<li><a href="${makeOldURL()}">${label}</a></li>`)
      $nav.append($button)
    }
  } else {
    let buttonStr
    if (isTop) {
      buttonStr = `<span>${isNotNIHONGO ? JumpToNew.en : JumpToNew.ja}</span>`
    } else {
      buttonStr = `<span class="lang-en lang-child ${
        !isNotNIHONGO ? 'hidden-lang' : ''
      }">jump to Beta</span>
        <span class="lang-ja lang-child ${isNotNIHONGO ? 'hidden-lang' : ''}">${
    JumpToNew.ja
  }</span>`
    }
    const $button = $(`<li><a href="${makeNewURL()}">
      <span class="lang lang-selected">
      ${buttonStr}
      </span>
      </a></li>`)
    $nav.append($button)
  }

  // assignments -> tasks
  function makeNewURL () {
    const { paths } = transformToNew({
      hosts: host.split('.'),
      paths: pathname.split('/')
    })
    return 'https://atcoder.jp/' + paths.join('/')
  }

  function transformToNew ({ hosts, paths }) {
    paths = paths.filter(el => el !== '')
    if (paths[0] === 'submissions' && paths[1] === 'all') {
      paths = ['submissions']
    }

    if (hosts[1] === 'contest' && paths[0] === 'editorial') {
      paths.shift()
    }

    hosts.length -= Math.min(hosts.length, 2) // atcoder jp を削除
    hosts.reverse()
    // hosts = ["constest", <contest-id>] になっているはず
    if (hosts[0]) hosts[0] += 's'
    //
    if (paths[0] === ASSIGHNMENTS) paths[0] = TASKS
    //
    paths = [].concat(hosts, paths)
    return { paths }
  }

  // tasks -> assignments
  // tasks/* -> tasks/*
  function makeOldURL () {
    const { paths, hosts } = transformToOld({
      paths: pathname.split('/')
    })
    return `http://${hosts.map(el => el + '.').join('')}atcoder.jp/${paths.join(
      '/'
    )}`
  }

  function isJumpableToOld () {
    const paths = pathname.split('/').filter(e => e)
    if (paths.length <= 1) return false
    if (paths[1] === 'archive') return false
    return true
  }

  function transformToOld ({ paths }) {
    paths = paths.filter(el => el !== '')

    if (
      paths[0] === 'contests' &&
      paths[2] === 'submissions' &&
      paths.length === 3
    ) {
      paths.push('all')
    }

    const hosts = [].concat(paths)
    while (paths[0] && !subs.includes(paths[0])) paths.shift()
    hosts.length -= paths.length
    if (hosts[0]) hosts[0] = hosts[0].replace(/s$/, '')
    hosts.reverse()
    //
    if (paths[0] === TASKS && !paths[1]) paths[0] = ASSIGHNMENTS
    //
    return { hosts, paths }
  }

  function makeNav () {
    if (isNew) {
      $nav = $(`<ul class="nav navbar-nav">`)
      $('.navbar-right')
        .eq(0)
        .before($nav)
    } else {
      $nav = $(`<ul class="nav">`)
      $('.nav')
        .eq(0)
        .before($nav)
    }
  }

  // 以下、AtCoderから

  function browserLanguage () {
    if (navigator.browserLanguage !== undefined) {
      return navigator.browserLanguage.substr(0, 2)
    }

    if (navigator.language !== undefined) {
      return navigator.language.substr(0, 2)
    }

    if (navigator.userLanguage !== undefined) {
      return navigator.userLanguage.substr(0, 2)
    }
  }
  function isValidLanguage (language) {
    var ret = false
    const languages = ['ja', 'en', 'ko']
    for (var i = 0, length = languages.length; i < length; i++) {
      if (language === languages[i]) {
        ret = true
        break
      }
    }
    return ret
  }
  // for Old, not TopPage
  function getLang () {
    /* eslint camelcase: "off" */
    let browser_language = browserLanguage()
    let cookie_language = $.cookie('language')
    let lang = ''
    if (cookie_language === null) {
      let default_lang = $('#atcoder-default-lang').data('lang')
      if (default_lang !== undefined && isValidLanguage(default_lang)) {
        lang = default_lang
      } else {
        if (
          browser_language === undefined ||
          !isValidLanguage(browser_language)
        ) {
          lang = 'en'
        } else {
          lang = browser_language
        }
      }
    } else {
      lang = cookie_language
    }
    return lang
  }
})()
