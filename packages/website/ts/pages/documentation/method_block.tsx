import * as _ from 'lodash';
import * as React from 'react';
import { Comment } from 'ts/pages/documentation/comment';
import { DocsInfo } from 'ts/pages/documentation/docs_info';
import { MethodSignature } from 'ts/pages/documentation/method_signature';
import { SourceLink } from 'ts/pages/documentation/source_link';
import { AnchorTitle } from 'ts/pages/shared/anchor_title';
import { HeaderSizes, Parameter, SolidityMethod, Styles, TypeDefinitionByName, TypescriptMethod } from 'ts/types';
import { colors } from 'ts/utils/colors';
import { typeDocUtils } from 'ts/utils/typedoc_utils';

interface MethodBlockProps {
    method: SolidityMethod | TypescriptMethod;
    sectionName: string;
    libraryVersion: string;
    typeDefinitionByName: TypeDefinitionByName;
    docsInfo: DocsInfo;
}

interface MethodBlockState {
    shouldShowAnchor: boolean;
}

const styles: Styles = {
    chip: {
        fontSize: 13,
        backgroundColor: colors.lightBlueA700,
        color: colors.white,
        height: 11,
        borderRadius: 14,
        marginTop: 19,
        lineHeight: 0.8,
    },
};

export class MethodBlock extends React.Component<MethodBlockProps, MethodBlockState> {
    constructor(props: MethodBlockProps) {
        super(props);
        this.state = {
            shouldShowAnchor: false,
        };
    }
    public render() {
        const method = this.props.method;
        if (typeDocUtils.isPrivateOrProtectedProperty(method.name)) {
            return null;
        }

        return (
            <div
                id={`${this.props.sectionName}-${method.name}`}
                style={{ overflow: 'hidden', width: '100%' }}
                className="pb4"
                onMouseOver={this._setAnchorVisibility.bind(this, true)}
                onMouseOut={this._setAnchorVisibility.bind(this, false)}
            >
                {!method.isConstructor && (
                    <div className="flex">
                        {(method as TypescriptMethod).isStatic && this._renderChip('Static')}
                        {(method as SolidityMethod).isConstant && this._renderChip('Constant')}
                        {(method as SolidityMethod).isPayable && this._renderChip('Payable')}
                        <AnchorTitle
                            headerSize={HeaderSizes.H3}
                            title={method.name}
                            id={`${this.props.sectionName}-${method.name}`}
                            shouldShowAnchor={this.state.shouldShowAnchor}
                        />
                    </div>
                )}
                <code className="hljs">
                    <MethodSignature
                        method={method}
                        sectionName={this.props.sectionName}
                        typeDefinitionByName={this.props.typeDefinitionByName}
                        docsInfo={this.props.docsInfo}
                    />
                </code>
                {(method as TypescriptMethod).source && (
                    <SourceLink
                        version={this.props.libraryVersion}
                        source={(method as TypescriptMethod).source}
                        baseUrl={this.props.docsInfo.packageUrl}
                        subPackageName={this.props.docsInfo.subPackageName}
                    />
                )}
                {method.comment && <Comment comment={method.comment} className="py2" />}
                {method.parameters &&
                    !_.isEmpty(method.parameters) && (
                        <div>
                            <h4 className="pb1 thin" style={{ borderBottom: '1px solid #e1e8ed' }}>
                                ARGUMENTS
                            </h4>
                            {this._renderParameterDescriptions(method.parameters)}
                        </div>
                    )}
                {method.returnComment && (
                    <div className="pt1 comment">
                        <h4 className="pb1 thin" style={{ borderBottom: '1px solid #e1e8ed' }}>
                            RETURNS
                        </h4>
                        <Comment comment={method.returnComment} />
                    </div>
                )}
            </div>
        );
    }
    private _renderChip(text: string) {
        return (
            <div className="p1 mr1" style={styles.chip}>
                {text}
            </div>
        );
    }
    private _renderParameterDescriptions(parameters: Parameter[]) {
        const descriptions = _.map(parameters, parameter => {
            const isOptional = parameter.isOptional;
            return (
                <div
                    key={`param-description-${parameter.name}`}
                    className="flex pb1 mb2"
                    style={{ borderBottom: '1px solid #f0f4f7' }}
                >
                    <div className="pl2 col lg-col-4 md-col-4 sm-col-12 col-12">
                        <div className="bold">{parameter.name}</div>
                        <div className="pt1" style={{ color: colors.grey, fontSize: 14 }}>
                            {isOptional && 'optional'}
                        </div>
                    </div>
                    <div className="col lg-col-8 md-col-8 sm-col-12 col-12">
                        {parameter.comment && <Comment comment={parameter.comment} />}
                    </div>
                </div>
            );
        });
        return descriptions;
    }
    private _setAnchorVisibility(shouldShowAnchor: boolean) {
        this.setState({
            shouldShowAnchor,
        });
    }
}
