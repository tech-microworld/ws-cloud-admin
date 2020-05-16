<template>
  <div class="json-editor">
    <textarea ref="textarea" />
  </div>
</template>

<script>
import CodeMirror from 'codemirror'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/rubyblue.css'
require('script-loader!jsonlint')
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/json-lint'

export default {
  name: 'JsonEditor',
  /* eslint-disable vue/require-prop-types */
  props: ['value'],
  data() {
    return {
      jsonEditor: false
    }
  },
  watch: {
    value(value) {
      const editorValue = this.jsonEditor.getValue()
      if (value !== editorValue) {
        let jsonStr = this.value
        if (typeof this.value !== 'string') {
          jsonStr = JSON.stringify(this.value, null, 2)
        }
        this.jsonEditor.setValue(jsonStr)
      }
    }
  },
  mounted() {
    this.jsonEditor = CodeMirror.fromTextArea(this.$refs.textarea, {
      lineNumbers: true,
      mode: 'application/json',
      gutters: ['CodeMirror-lint-markers'],
      theme: 'rubyblue',
      lint: true
    })

    let jsonStr = this.value
    if (typeof this.value !== 'string') {
      jsonStr = JSON.stringify(this.value, null, 2)
    }

    this.jsonEditor.setValue(jsonStr)
    this.jsonEditor.on('change', cm => {
      this.$emit('changed', cm.getValue())
      this.$emit('input', cm.getValue())
    })
  },
  methods: {
    getValue() {
      return this.jsonEditor.getValue()
    }
  }
}
</script>

<style scoped>
.json-editor {
  height: 100%;
  position: relative;
}
.json-editor >>> .CodeMirror {
  height: auto;
  min-height: 300px;
}
.json-editor >>> .CodeMirror-scroll {
  min-height: 300px;
}
.json-editor >>> .cm-s-rubyblue span.cm-string {
  color: #f08047;
}
</style>
