var UManiaApp = React.createClass({
  getInitialState: function() {
    return {
      title: 'uMania',
      probs: null,
      prob_categories: null,
      practice_categories: null
    }
  },
  componentDidMount: function() {
    $('.tabular.menu .item').tab();
    // app component
    var app        = this;
    // urls
    var problemUrl   = 'http://uhunt.felix-halim.net/api/p';
    var translateUrl = './data/translate.yml';
    // get problems
    $.getJSON(problemUrl, function (data) {
      var res = {
        probs: {},
        prob_categories: {}
      };
      data.map(function (prob) {
        var obj = {
          config: {
            main: 'uva'
          },
          judges: {
            uva: {
              id:    prob[0],
              num:   prob[1],
              title: prob[2],
              link:  'https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=' + prob[0],
              stat: {
                SE:  prob[7],
                CE:  prob[10],
                RF:  prob[11],
                RE:  prob[12],
                OLE: prob[13],
                TLE: prob[14],
                MLE: prob[15],
                WA:  prob[16],
                AC:  prob[17]
              }
            }
          }
        };
        res.probs['uva_id'  + obj.judges.uva.id]  = obj;
        res.probs['uva_num' + obj.judges.uva.num] = obj;
      });
      data.map(function (prob) {
        var num = Math.floor(prob[1] / 100);
        var obj = res.probs['uva_id' + prob[0]];
        if ( typeof(res.prob_categories[num]) === 'undefined' )
          res.prob_categories[num] = [];
        res.prob_categories[num].push(obj);
      });
      app.setState(res);
      // get translate
      $.get(translateUrl, function (str) {
        var data = YAML.parse(str);
        Object.keys(data).map(function (name) {
          if (name === 'Unfortunate 狗') {
            data[name].trans.map(function (num) {
              var obj = res.probs['uva_num' + num];
              if (typeof(obj.translate) === 'undefined')
                obj.translate = {};
              var vol = Math.floor(num / 100);
              obj.translate[name] = data[name].site + vol + '/p' + num;
            });
          }
          else {
            Object.keys(data[name].trans).map(function (num) {
              var obj = res.probs['uva_num' + num];
              if (typeof(obj.translate) === 'undefined')
                obj.translate = {};
              obj.translate[name] = data[name].site + data[name].trans[num];
            });
          }
        });
        app.setState(res);
      });
    })
  },
  componentDidUpdate: function() {
    document.title = this.state.title;
  },
  render: function() {
    var probs = this.state.probs;
    return (
    <div id="main" className="ui centered grid">
    <div id="content" className="fourteen wide column">
      <nav id="menu" className="ui top attached tabular labeled icon menu">
        <a className="active item" data-tab="home"><i className="grid layout icon"></i> uMania</a>
        <a className="item" data-tab="practice"><i className="puzzle icon"></i> Practice</a>
        <div className="right menu">
          <a className="ui simple dropdown item"><i className="setting icon"></i></a>
        </div>
      </nav>
      <ProblemSection categories={this.state.prob_categories} />
      <PracticeSection categories={this.state.practice_categories} />
    </div>
    </div>
    )
  }
});

var ProblemSection = React.createClass({
  componentDidMount: function() {
    $('.ui.accordion').accordion();
  },
  render: function() {
    var volume  = this.props.categories || {};
    var loading = this.props.categories ? '' : 'loading ';
    return (
      <section id="problem" className={"ui active bottom attached " + loading + "tab accordion segment"} data-tab="home">
      {
        Object.keys(volume).map(function (vol) {
          return (
            <article id={"volume" + vol} className="ui list">
            <div className="ui title item">
              <i className="huge checkmark icon"></i>
              <div className="content">
                <header className="header"><h1>Volume {vol}</h1></header>
                <div className="description">
                {
                  volume[vol].map(function (prob) {
                    return <div className="ui basic empty circular label"></div>
                  })
                }
                </div>
              </div>
            </div>
            <div className="content">
              <div className="ui doubling six column grid">
              {
                volume[vol].map(function (prob) {
                  return <Problem prob={prob} />
                })
              }
              </div>
            </div>
            </article>
          )
        })
      }
      </section>
    )
  }
});

var PracticeSection = React.createClass({
  render: function() {
    return (
      <section id="practice" className="ui center aligned bottom attached tab segment" data-tab="practice">
      </section>
    )
  }
});

var Problem = React.createClass({
  render: function() {
    var dummyProb = {
      config: {
        main: ''
      },
      judges: {
        '': {
          id: 0,
          num: 0,
          link: '',
          title: ''
        }
      },
      translate: {}
    };
    var prob      = this.props.prob || dummyProb;
    var config    = prob.config     || {};
    var translate = prob.translate  || {};
    var main      = config.main     || '';
    return (
      <div className="column">
      <div className="ui left aligned items segment">
        <div className="item">
        <div className="content">
          <a className="header" href={prob.judges[main].link} target="_blank">
            {main + ' ' + prob.judges[main].num}
          </a>
          <div className="meta">
            {prob.judges[main].title}
          </div>
          <div className="description">
            <div className="ui list">
            {
              Object.keys(translate).map(function (trans) {
                return (
                  <div className="item">
                    <i className="world icon"></i>
                    <div className="content">
                      <a href={translate[trans]} target="_blank">{trans}</a>
                    </div>
                  </div>
                )
              })
            }
            </div>
          </div>
        </div>
        </div>
      </div>
      </div>
    )
  }
});

$(document).ready(function() {
  ReactDOM.render(<UManiaApp />, document.body);
});