// ==UserScript==
// @name         AtJumper
// @namespace    https://twitter.com/lumc_
// @version      1.1
// @description  Jump AtCoder between beta and legacy
// @author       Luma
// @include      http://*atcoder.jp/*
// @include      https://*atcoder.jp/*
// @include      https://beta.atcoder.jp/*
// ==/UserScript==

/*
v1.1 更新のお知らせ
バグ修正など.
*/

// 404でないページを前提しています

/* global $, LANG */

;(function () {
  'use strict'
  const host = location.host
  const pathname = location.pathname
  const isBeta = !!host.match(/.*beta\.atcoder\.jp$/)
  const isTop = host === 'atcoder.jp'
  const existNav = isBeta ? false : $('.nav').attr('id') !== 'nav-right-logined'
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

  const isNotNIHONGO = isBeta
    ? LANG !== 'ja'
    : isTop
      ? !$('a.dropdown-toggle')
        .eq(0)
        .html()
        .match(/日本語/)
      : getLang() !== 'ja'

  let $nav = existNav && $('.nav').eq(0)

  if (!existNav) makeNav()

  if (isBeta) {
    const label = isNotNIHONGO ? 'jump to Legacy' : 'Legacyへ'
    const $button = $(`<li><a href="${makeLegacyURL()}">${label}</a></li>`)
    $nav.append($button)
  } else {
    let buttonStr
    if (isTop) {
      buttonStr = `<span>${isNotNIHONGO ? 'jump to Beta' : 'Betaへ'}</span>`
    } else {
      buttonStr = `<span class="lang-en lang-child ${
        !isNotNIHONGO ? 'hidden-lang' : ''
      }">jump to Beta</span>
        <span class="lang-ja lang-child ${
  isNotNIHONGO ? 'hidden-lang' : ''
  }">Betaへ</span>`
    }
    const $button = $(`<li><a href="${makeBetaURL()}">
      <span class="lang lang-selected">
      ${buttonStr}
      </span>
      </a></li>`)
    $nav.append($button)
  }

  // assignments -> tasks
  function makeBetaURL () {
    const { paths } = transformToBeta({
      hosts: host.split('.'),
      paths: pathname.split('/')
    })
    return 'https://beta.atcoder.jp/' + paths.join('/')
  }

  function transformToBeta ({ hosts, paths }) {
    paths = paths.filter(el => el !== '')
    if (paths[0] === 'user') {
      paths[0] = 'users'
      return { paths }
    }
    if (paths[0] === 'settings' || paths[0] === 'users') {
      return { paths }
    }

    if (paths[0] === 'submissions' && paths[1] === 'all') {
      paths = ['submissions']
    }

    if (hosts[1] === 'contest' && paths[0] === 'editorial') {
      paths.shift()
    }

    hosts.length -= Math.min(hosts.length, 2)
    hosts.reverse()
    if (hosts[0]) hosts[0] += 's'
    //
    if (paths[0] === ASSIGHNMENTS) paths[0] = TASKS
    //
    paths = [].concat(hosts, paths)
    return { paths }
  }

  // tasks -> assignments
  // tasks/* -> tasks/*
  function makeLegacyURL () {
    const { paths, hosts } = transformToLegacy({
      paths: pathname.split('/')
    })
    return `http://${hosts.map(el => el + '.').join('')}atcoder.jp/${paths.join(
      '/'
    )}`
  }

  function transformToLegacy ({ paths }) {
    paths = paths.filter(el => el !== '')
    if (paths[0] === 'users') {
      paths[0] = 'user'
      return { hosts: [], paths }
    }
    if (paths[0] === 'settings') {
      // えーiconが存在しないため (gravatarなので)
      if (paths[1] === 'icon') paths.pop()
      return { hosts: ['practice', 'contest'], paths }
    }

    if (
      paths[0] === 'contests' &&
      paths[2] === 'submissions' &&
      paths[3] !== 'me'
    ) {
      paths[3] = 'all'
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
    if (isBeta) {
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
  // for Legacy, not TopPage
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
