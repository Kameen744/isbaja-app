<script setup>
const props = defineProps({
  modelValue: "",
  label: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  col: {
    default: 4,
  },
});

const emit = defineEmits(["update:modelValue"]);
const onInput = (event) => {
  emit("update:modelValue", event.target.value);
};
</script>

<template>
  <div class="col-12" :class="`col-lg-${col} col-sm-${col}`">
    <div class="form-group">
      <label>{{ label }}</label>
      <select class="form-control" :value="modelValue" @change="onInput">
        <option value="" disabled="" selected="">{{ label }}</option>
        <option
          :value="option.id ?? option"
          v-for="option in options"
          :key="option.id ?? option"
        >
          {{ option.name ?? option }}
        </option>
      </select>
    </div>
  </div>
</template>
