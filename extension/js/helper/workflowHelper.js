import { WorkflowList } from '../collection/workflow'

const Workflows = new WorkflowList();

const workflowHelper = {
    create: function(info) {
        if (info.title && info.content) {
            const workflow = Workflows.create({
                ...info
            });

            return workflow;
        } else {
            return 'no title or content';
        }
    },

    remove: function(id) {
        const model = Workflows.remove(id);
        Workflows.chromeStorage.destroy(model);

        return model;
    },

    update: function(attrs) {
        const workflow = Workflows.set(attrs, {
            add: false,
            remove: false
        });

        workflow.save();

        return workflow;
    },

    refresh() {
        return Workflows.fetch();
    },

    getWorkflow(id) {
        return Workflows.findWhere({
            id
        });
    },

    getWorkflows: function() {
        return Workflows.toJSON();
    },

    init: function() {
        return workflowHelper.refresh();
    }
};

export default workflowHelper;