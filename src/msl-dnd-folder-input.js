msl_upload.directive('mslDndFolderInput', function () {
	function folderUploadAvailable() {
		var dummy = document.createElement('input');
		return 'webkitdirectory' in dummy;
	}

	return {
		restrict: 'A',
		link: function (scope, element, attributes) {
			var handler = attributes['mslDndFolderInput'];
			if (!handler) throw 'msl-dnd-folder-input: You should specify a folder selection handler';
			if (!scope[handler]) throw 'msl-dnd-folder-input: The specified handler doesn\'t exist in your scope';

			var processedFiles = 0;
            var allFiles = 0;
            var completedFiles = [];
			function exploreFolder(item) {
				if (item.isFile) {
                    item.file(function(file){
                        completedFiles.push(file);
                        processedFiles++;
                        if(processedFiles == allFiles){
                            scope.$apply(function () { scope[handler](completedFiles); });
                        }
                    });
				} else if (item.isDirectory) {
					var directory_reader = item.createReader();
			    	directory_reader.readEntries(function(entries) {
						for (var i = 0; i < entries.length; i++) {
							var entry = entries[i];
							exploreFolder(entry);
						}
    				});
				}
			};

			element.bind('dragover', function (event) {
				event.preventDefault();
				element.addClass('msl-drag-over');
			});
			element.bind('dragleave', function (event) {
				element.removeClass('msl-drag-over');
			});
			element.bind('drop', function (event) {
				event.preventDefault();
				element.removeClass('msl-drag-over');
				if (folderUploadAvailable()) {
					var roots = event.dataTransfer.items;
					allFiles = roots.length;
                    completedFiles = [];
                    processedFiles = 0;
					for (var i = 0; i < roots.length; i++) {
						var root = roots[i].webkitGetAsEntry();
						exploreFolder(root);
					}
				} else {
					var files = event.dataTransfer.files;
					scope.$apply(function () { scope[handler](files); });
				}
			});
		}
	};
});